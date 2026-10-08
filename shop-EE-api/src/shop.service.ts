import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { DataSource, EntityManager, In } from 'typeorm';
import { AiService } from './ai/ai.service';
import {
  Category,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductType,
  ProductVariant,
  Role,
  ShopOrder,
  TransferPayment,
  User,
} from './database/entities';
import {
  AiDescriptionDto,
  CreateOrderDto,
  ProductDto,
  RejectDto,
  RegisterDto,
  VariantDto,
} from './app.dto';

const PAID_ORDER_STATUSES = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

@Injectable()
export class ShopService implements OnModuleInit {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly ai: AiService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL', 'admin@shopp.local').toLowerCase();
    const existing = await this.dataSource.getRepository(User).findOneBy({ email });
    if (existing) return;
    const admin = this.dataSource.getRepository(User).create({
      email,
      fullName: 'Administrador',
      role: Role.ADMIN,
      passwordHash: await hash(this.config.get<string>('ADMIN_PASSWORD', 'Admin123!'), 12),
    });
    await this.dataSource.getRepository(User).save(admin);
    this.logger.log(`Seeded initial administrator ${email}`);
  }

  async register(input: RegisterDto): Promise<{ token: string; role: Role }> {
    const users = this.dataSource.getRepository(User);
    const email = input.email.toLowerCase();
    if (await users.existsBy({ email })) throw new ConflictException('El correo ya esta registrado');
    const user = users.create({
      email,
      fullName: input.fullName,
      passwordHash: await hash(input.password, 12),
      role: Role.CUSTOMER,
    });
    try {
      await users.save(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) throw new ConflictException('El correo ya esta registrado');
      throw error;
    }
    return this.tokenFor(user);
  }

  async login(email: string, password: string): Promise<{ token: string; role: Role }> {
    const user = await this.dataSource.getRepository(User).findOneBy({ email: email.toLowerCase() });
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return this.tokenFor(user);
  }

  private tokenFor(user: User): Promise<{ token: string; role: Role }> {
    return this.jwt.signAsync({ sub: user.id, role: user.role }).then((token) => ({ token, role: user.role }));
  }

  async listProducts(query: {
    q?: string;
    categoryId?: string;
    type?: ProductType;
    page?: number;
    size?: number;
  }) {
    const page = Math.max(0, query.page ?? 0);
    if (!Number.isInteger(page)) throw new BadRequestException('Pagina invalida');
    const requestedSize = query.size ?? 20;
    if (!Number.isInteger(requestedSize)) throw new BadRequestException('Tamano de pagina invalido');
    const size = Math.min(100, Math.max(1, requestedSize));
    const qb = this.dataSource.getRepository(Product).createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant')
      .where('product.active = true');
    if (query.q?.trim()) qb.andWhere('LOWER(product.name) LIKE :q', { q: `%${query.q.trim().toLowerCase()}%` });
    if (query.categoryId) qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    if (query.type) qb.andWhere('product.type = :type', { type: query.type });
    qb.orderBy('product.createdAt', 'DESC').skip(page * size).take(size);
    const [products, totalElements] = await qb.getManyAndCount();
    return {
      content: products.map((product) => this.productResponse(product)),
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  }

  async getProduct(id: string) {
    const product = await this.dataSource.getRepository(Product).findOne({
      where: { id, active: true },
      relations: { category: true, variants: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.productResponse(product);
  }

  listCategories(): Promise<Category[]> {
    return this.dataSource.getRepository(Category).find({ order: { name: 'ASC' } });
  }

  async createCategory(name: string): Promise<Category> {
    return this.dataSource.getRepository(Category).save({ name: name.trim() });
  }

  async createProduct(input: ProductDto) {
    const product = this.dataSource.getRepository(Product).create();
    await this.applyProduct(product, input);
    return this.productResponse(await this.dataSource.getRepository(Product).save(product));
  }

  async updateProduct(id: string, input: ProductDto) {
    const repo = this.dataSource.getRepository(Product);
    const product = await repo.findOne({ where: { id }, relations: { variants: true, category: true } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.applyProduct(product, input);
    return this.productResponse(await repo.save(product));
  }

  async deactivateProduct(id: string): Promise<void> {
    const repo = this.dataSource.getRepository(Product);
    const product = await repo.findOneBy({ id });
    if (!product) throw new NotFoundException('Producto no encontrado');
    product.active = false;
    await repo.save(product);
  }

  private async applyProduct(product: Product, input: ProductDto): Promise<void> {
    const repo = this.dataSource.getRepository(Product);
    if (input.type === ProductType.DIGITAL && !input.digitalFileUrl?.trim()) {
      throw new BadRequestException('Un producto digital necesita digitalFileUrl');
    }
    const duplicateSku = await repo.findOneBy({ sku: input.sku });
    if (duplicateSku && duplicateSku.id !== product.id) throw new ConflictException('El SKU ya existe');
    let category: Category | null = null;
    if (input.categoryId) {
      category = await this.dataSource.getRepository(Category).findOneBy({ id: input.categoryId });
      if (!category) throw new BadRequestException('Categoria invalida');
    }
    product.sku = input.sku;
    product.name = input.name;
    product.description = input.description ?? null;
    product.price = money(input.price);
    product.type = input.type;
    product.stock = input.type === ProductType.PHYSICAL ? input.stock ?? 0 : null;
    product.digitalFileUrl = input.digitalFileUrl ?? null;
    product.imageUrl = input.imageUrl ?? null;
    product.category = category;
    if (product.variants?.length) {
      await this.dataSource.getRepository(ProductVariant).remove(product.variants);
    }
    product.variants = (input.variants ?? []).map((variant: VariantDto) =>
      Object.assign(new ProductVariant(), {
        product,
        name: variant.name,
        priceDelta: money(variant.priceDelta ?? 0),
        stock: input.type === ProductType.PHYSICAL ? variant.stock ?? 0 : null,
      }),
    );
  }

  async aiDescription(input: AiDescriptionDto) {
    const description = await this.ai.complete(
      'Eres redactor de catalogos de ecommerce en espanol. Escribe descripciones claras, honestas y de maximo 80 palabras. Sin emojis.',
      `Producto: ${input.name}\nNotas: ${input.notes ?? ''}`,
      300,
    );
    return { description: description ?? '', aiEnabled: this.ai.isEnabled };
  }

  async createOrder(userId: string, input: CreateOrderDto) {
    const order = await this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOneBy({ id: userId });
      if (!user) throw new UnauthorizedException('Usuario no encontrado');
      const newOrder = manager.getRepository(ShopOrder).create({
        user,
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddress: input.shippingAddress ?? null,
        notes: input.notes ?? null,
        items: [],
      });
      let totalCents = 0;
      let containsPhysical = false;
      for (const line of input.items) {
        const product = await manager.getRepository(Product).createQueryBuilder('product')
          .leftJoinAndSelect('product.variants', 'variant')
          .setLock('pessimistic_write', undefined, ['product'])
          .where('product.id = :id AND product.active = true', { id: line.productId })
          .getOne();
        if (!product) throw new NotFoundException(`Producto no disponible: ${line.productId}`);
        const variant = line.variantId
          ? product.variants.find((candidate) => candidate.id === line.variantId)
          : undefined;
        if (line.variantId && !variant) throw new BadRequestException(`Variedad invalida para ${product.name}`);
        if (!line.variantId && product.variants.length) {
          throw new BadRequestException(`Debes elegir una variedad de ${product.name}`);
        }
        if (product.type === ProductType.PHYSICAL) {
          containsPhysical = true;
          await this.reserveStock(manager, product, variant, line.quantity);
        }
        const unitCents = cents(product.price) + (variant ? cents(variant.priceDelta) : 0);
        totalCents += unitCents * line.quantity;
        newOrder.items.push(manager.getRepository(OrderItem).create({
          order: newOrder,
          product,
          variant: variant ?? null,
          quantity: line.quantity,
          unitPrice: fromCents(unitCents),
        }));
      }
      if (containsPhysical && !input.shippingAddress?.trim()) {
        throw new BadRequestException('La direccion de envio es obligatoria para productos fisicos');
      }
      newOrder.total = fromCents(totalCents);
      const saved = await manager.getRepository(ShopOrder).save(newOrder);
      await manager.getRepository(TransferPayment).save({
        order: saved,
        referenceCode: this.newReference(),
        status: PaymentStatus.AWAITING_TRANSFER,
      });
      return saved;
    });
    return this.getOrder(userId, order.id);
  }

  async listOrders(userId: string) {
    const orders = await this.dataSource.getRepository(ShopOrder).find({
      where: { user: { id: userId } },
      relations: { user: true, items: { product: true, variant: true } },
      order: { createdAt: 'DESC' },
    });
    const payments = await this.paymentsFor(orders.map((order) => order.id));
    return orders.map((order) => this.orderResponse(order, payments.get(order.id)!));
  }

  async getOrder(userId: string, id: string, admin = false) {
    const order = await this.loadOrder(this.dataSource.manager, id);
    if (!admin && order.user.id !== userId) throw new NotFoundException('Pedido no encontrado');
    const payment = await this.dataSource.getRepository(TransferPayment).findOneBy({ order: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return this.orderResponse(order, payment);
  }

  async cancelOrder(userId: string, id: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const order = await this.loadOrder(manager, id, true);
      if (order.user.id !== userId) throw new NotFoundException('Pedido no encontrado');
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new ConflictException('Solo se cancelan pedidos pendientes de pago');
      }
      for (const item of order.items) {
        if (item.product.type !== ProductType.PHYSICAL) continue;
        if (item.variant) {
          await manager.increment(ProductVariant, { id: item.variant.id }, 'stock', item.quantity);
        } else {
          await manager.increment(Product, { id: item.product.id }, 'stock', item.quantity);
        }
      }
      order.status = OrderStatus.CANCELLED;
      const payment = await manager.getRepository(TransferPayment).findOneBy({ order: { id } });
      if (!payment) throw new NotFoundException('Pago no encontrado');
      await manager.getRepository(ShopOrder).save(order);
      return { order, payment };
    });
    return this.orderResponse(result.order, result.payment);
  }

  async downloads(userId: string, id: string) {
    const order = await this.loadOrder(this.dataSource.manager, id);
    if (order.user.id !== userId) throw new NotFoundException('Pedido no encontrado');
    if ([OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_REVIEW, OrderStatus.CANCELLED].includes(order.status)) {
      throw new ForbiddenException('Los archivos se habilitan cuando se confirma el pago');
    }
    return order.items
      .filter((item) => item.product.type === ProductType.DIGITAL)
      .map((item) => ({ name: item.product.name, url: item.product.digitalFileUrl }));
  }

  async submitProof(userId: string, id: string, transferReference: string, proofUrl: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const order = await this.loadOrder(manager, id, true);
      if (order.user.id !== userId) throw new NotFoundException('Pedido no encontrado');
      const payment = await manager.getRepository(TransferPayment).findOneBy({ order: { id } });
      if (!payment) throw new NotFoundException('Pago no encontrado');
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new ConflictException('El pedido no esta pendiente de pago');
      }
      payment.transferReference = transferReference;
      payment.proofUrl = proofUrl;
      payment.status = PaymentStatus.SUBMITTED;
      payment.submittedAt = new Date();
      payment.rejectionReason = null;
      order.status = OrderStatus.PAYMENT_REVIEW;
      await manager.getRepository(TransferPayment).save(payment);
      await manager.getRepository(ShopOrder).save(order);
      return { order, payment };
    });
    return this.orderResponse(result.order, result.payment);
  }

  async pendingPayments() {
    const payments = await this.dataSource.getRepository(TransferPayment).find({
      where: { status: PaymentStatus.SUBMITTED },
      relations: { order: true },
      order: { submittedAt: 'ASC' },
    });
    return payments.map((payment) => ({
      paymentId: payment.id,
      orderId: payment.order.id,
      referenceCode: payment.referenceCode,
      transferReference: payment.transferReference,
      proofUrl: payment.proofUrl,
      submittedAt: payment.submittedAt,
      amount: Number(payment.order.total),
    }));
  }

  async approvePayment(id: string) {
    const payment = await this.reviewPayment(id, PaymentStatus.APPROVED);
    if (this.hasPhysicalItems(payment.order)) await this.createShipment(payment.order);
    return this.getOrder(payment.order.user.id, payment.order.id, true);
  }

  async rejectPayment(id: string, input: RejectDto) {
    const payment = await this.reviewPayment(id, PaymentStatus.REJECTED, input.reason ?? null);
    return this.orderResponse(payment.order, payment);
  }

  async retryShipment(id: string) {
    const order = await this.loadOrder(this.dataSource.manager, id);
    if (order.status !== OrderStatus.PAID || !this.hasPhysicalItems(order) || order.shipmentId) {
      throw new ConflictException('Este pedido no requiere crear un envio');
    }
    await this.createShipment(order);
    return this.getOrder(order.user.id, id, true);
  }

  private async reviewPayment(id: string, status: PaymentStatus, reason: string | null = null) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.getRepository(TransferPayment).createQueryBuilder('payment')
        .innerJoinAndSelect('payment.order', 'order')
        .innerJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.items', 'item')
        .leftJoinAndSelect('item.product', 'product')
        .leftJoinAndSelect('item.variant', 'variant')
        .setLock('pessimistic_write', undefined, ['payment', 'order'])
        .where('payment.id = :id', { id })
        .getOne();
      if (!payment) throw new NotFoundException('Pago no encontrado');
      if (payment.status !== PaymentStatus.SUBMITTED) {
        throw new ConflictException('El pago no esta en revision');
      }
      payment.status = status;
      payment.reviewedAt = new Date();
      payment.rejectionReason = reason;
      payment.order.status = status === PaymentStatus.APPROVED ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT;
      await manager.getRepository(TransferPayment).save(payment);
      await manager.getRepository(ShopOrder).save(payment.order);
      return payment;
    });
  }

  private async createShipment(order: ShopOrder): Promise<void> {
    const baseUrl = this.config.get<string>('SHIPPING_URL', 'http://localhost:3000').replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/shipments`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.config.get<string>('SHIPPING_API_KEY', 'dev-shipping-key'),
        },
        body: JSON.stringify({
          orderId: order.id,
          recipientName: order.user.fullName,
          address: order.shippingAddress,
          items: order.items
            .filter((item) => item.product.type === ProductType.PHYSICAL)
            .map((item) => ({
              name: `${item.product.name}${item.variant ? ` - ${item.variant.name}` : ''}`,
              quantity: item.quantity,
            })),
        }),
      });
      if (!response.ok) throw new Error(`Shipping service returned HTTP ${response.status}`);
      const shipment = await response.json() as { id: string; trackingCode: string };
      if (!shipment.id || !shipment.trackingCode) throw new Error('Shipping service returned an invalid shipment');
      order.shipmentId = shipment.id;
      order.trackingCode = shipment.trackingCode;
      await this.dataSource.getRepository(ShopOrder).save(order);
    } catch (error) {
      this.logger.error(`Could not create shipment for order ${order.id}: ${(error as Error).message}`);
    }
  }

  async updateShippingStatus(id: string, status: string, trackingCode?: string): Promise<void> {
    const order = await this.dataSource.getRepository(ShopOrder).findOneBy({ id });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (status === 'IN_TRANSIT') order.status = OrderStatus.SHIPPED;
    if (status === 'DELIVERED') order.status = OrderStatus.DELIVERED;
    if (trackingCode) order.trackingCode = trackingCode;
    await this.dataSource.getRepository(ShopOrder).save(order);
  }

  async recommendationsForProduct(productId: string, requestedLimit: number) {
    const limit = boundedLimit(requestedLimit);
    const boughtTogether = await this.dataSource.getRepository(OrderItem).createQueryBuilder('a')
      .innerJoin('a.order', 'order')
      .innerJoin('order.items', 'b')
      .innerJoin('a.product', 'productA')
      .innerJoin('b.product', 'product')
      .select('product.id', 'productId')
      .addSelect('COUNT(*)', 'purchaseCount')
      .where('productA.id = :productId AND product.id <> :productId', { productId })
      .andWhere('order.status IN (:...statuses)', { statuses: PAID_ORDER_STATUSES })
      .andWhere('product.active = true')
      .groupBy('b.productId')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string }>();
    const ids = boughtTogether.map((row) => row.productId);
    if (ids.length < limit) {
      const filled = await this.fillRecommendations(ids, limit, new Set([productId]));
      return this.loadProducts(filled);
    }
    return this.loadProducts(ids);
  }

  async recommendationsForUser(userId: string, requestedLimit: number) {
    const limit = boundedLimit(requestedLimit);
    const itemRepo = this.dataSource.getRepository(OrderItem);
    const purchasedProducts = await itemRepo.createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .select('DISTINCT product.id', 'id')
      .innerJoin('item.order', 'order')
      .where('order.userId = :userId', { userId })
      .getRawMany<{ id: string }>();
    const purchasedIds = purchasedProducts.map((row) => row.id);
    const categoryRows = await itemRepo.createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .innerJoin('product.category', 'category')
      .select('DISTINCT category.id', 'id')
      .where('order.userId = :userId', { userId })
      .getRawMany<{ id: string }>();
    const categoryIds = categoryRows.map((row) => row.id);
    let candidates: Product[] = [];
    if (categoryIds.length) {
      candidates = await this.dataSource.getRepository(Product).createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.variants', 'variant')
        .where('product.active = true AND category.id IN (:...categoryIds)', { categoryIds })
        .andWhere(purchasedIds.length ? 'product.id NOT IN (:...purchasedIds)' : '1 = 1', { purchasedIds })
        .orderBy('product.createdAt', 'DESC')
        .take(20)
        .getMany();
    }
    let candidateIds = candidates.map((product) => product.id);
    candidateIds = await this.rerankWithAi(purchasedIds, candidates) ?? candidateIds;
    if (candidateIds.length < limit) {
      candidateIds = await this.fillRecommendations(candidateIds, limit, new Set(purchasedIds));
    }
    return this.loadProducts(candidateIds.slice(0, limit));
  }

  private async rerankWithAi(purchasedIds: string[], candidates: Product[]): Promise<string[] | null> {
    if (!this.ai.isEnabled || candidates.length < 2 || !purchasedIds.length) return null;
    const bought = await this.dataSource.getRepository(Product).findBy({ id: In(purchasedIds) });
    const prompt = `El cliente compro: ${bought.map((product) => product.name).join('; ')}\n\n` +
      `Candidatos (id | nombre | precio):\n${candidates.map((product) =>
        `${product.id} | ${product.name} | ${product.price}`).join('\n')}`;
    const answer = await this.ai.complete(
      'Eres un motor de recomendaciones de ecommerce. Responde SOLO con un arreglo JSON de ids (strings), del mas al menos relevante. Usa unicamente ids de la lista.',
      prompt,
      600,
    );
    if (!answer) return null;
    try {
      const json = answer.slice(answer.indexOf('['), answer.lastIndexOf(']') + 1);
      if (!json.startsWith('[')) return null;
      const proposed: unknown = JSON.parse(json);
      if (!Array.isArray(proposed)) return null;
      const validIds = new Set(candidates.map((product) => product.id));
      const ids = [...new Set(proposed.filter((id): id is string => typeof id === 'string' && validIds.has(id)))];
      for (const product of candidates) if (!ids.includes(product.id)) ids.push(product.id);
      return ids;
    } catch {
      this.logger.warn('AI recommendation response was invalid; using rule-based ordering');
      return null;
    }
  }

  private async fillRecommendations(current: string[], limit: number, excluded: Set<string>) {
    const rows = await this.dataSource.getRepository(OrderItem).createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('SUM(item.quantity)', 'quantity')
      .where('order.status IN (:...statuses) AND product.active = true', { statuses: PAID_ORDER_STATUSES })
      .groupBy('product.id')
      .orderBy('SUM(item.quantity)', 'DESC')
      .take(limit + excluded.size + 5)
      .getRawMany<{ productId: string }>();
    const result = [...new Set(current)];
    for (const row of rows) {
      if (!excluded.has(row.productId) && !result.includes(row.productId)) result.push(row.productId);
      if (result.length >= limit) break;
    }
    return result;
  }

  private async loadProducts(ids: string[]) {
    if (!ids.length) return [];
    const products = await this.dataSource.getRepository(Product).find({
      where: { id: In(ids), active: true },
      relations: { category: true, variants: true },
    });
    const byId = new Map(products.map((product) => [product.id, product]));
    return ids.flatMap((id) => {
      const product = byId.get(id);
      return product ? [this.productResponse(product)] : [];
    });
  }

  private async reserveStock(
    manager: EntityManager,
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
  ): Promise<void> {
    const available = variant ? variant.stock : product.stock;
    if (available === null || available === undefined || available < quantity) {
      throw new ConflictException(
        `Sin stock suficiente de ${product.name}${variant ? ` (${variant.name})` : ''}`,
      );
    }
    if (variant) {
      variant.stock = available - quantity;
      await manager.getRepository(ProductVariant).save(variant);
    } else {
      product.stock = available - quantity;
      await manager.getRepository(Product).save(product);
    }
  }

  private async loadOrder(manager: EntityManager, id: string, lock = false): Promise<ShopOrder> {
    const query = manager.getRepository(ShopOrder).createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('item.variant', 'variant')
      .where('order.id = :id', { id });
    if (lock) query.setLock('pessimistic_write', undefined, ['order']);
    const order = await query.getOne();
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  private async paymentsFor(orderIds: string[]): Promise<Map<string, TransferPayment>> {
    if (!orderIds.length) return new Map();
    const payments = await this.dataSource.getRepository(TransferPayment).find({
      where: { order: { id: In(orderIds) } },
      relations: { order: true },
    });
    return new Map(payments.map((payment) => [payment.order.id, payment]));
  }

  private orderResponse(order: ShopOrder, payment: TransferPayment) {
    const instructions = [PaymentStatus.AWAITING_TRANSFER, PaymentStatus.REJECTED].includes(payment.status)
      ? {
          bank: this.config.get<string>('BANK_NAME', 'Banco Ejemplo'),
          accountType: this.config.get<string>('BANK_ACCOUNT_TYPE', 'Ahorros'),
          accountNumber: this.config.get<string>('BANK_ACCOUNT_NUMBER', '000-000000-00'),
          holder: this.config.get<string>('BANK_HOLDER', 'SHOPP S.A.S.'),
          document: this.config.get<string>('BANK_DOCUMENT', 'NIT 900.000.000-0'),
          concept: payment.referenceCode,
          amount: Number(order.total),
        }
      : null;
    return {
      id: order.id,
      status: order.status,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      trackingCode: order.trackingCode,
      items: (order.items ?? []).map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        variant: item.variant?.name ?? null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      payment: {
        status: payment.status,
        referenceCode: payment.referenceCode,
        rejectionReason: payment.rejectionReason,
        instructions,
      },
    };
  }

  private productResponse(product: Product) {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      type: product.type,
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category?.name ?? null,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceDelta: Number(variant.priceDelta),
        stock: variant.stock,
      })),
    };
  }

  private hasPhysicalItems(order: ShopOrder): boolean {
    return (order.items ?? []).some((item) => item.product.type === ProductType.PHYSICAL);
  }

  private newReference(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(8);
    return `SHOPP-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`;
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error &&
      (error as { code?: string }).code === '23505';
  }
}

function cents(value: string | number): number {
  const [whole, fraction = ''] = String(value).split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function money(value: string | number): string {
  return fromCents(cents(value));
}

function boundedLimit(value: number): number {
  return Math.min(20, Math.max(1, Number.isFinite(value) ? Math.trunc(value) : 6));
}
