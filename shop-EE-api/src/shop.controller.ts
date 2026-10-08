import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { AuthUser, AuthenticatedUser, Public, Roles, RolesGuard, JwtAuthGuard } from './auth/auth.guard';
import {
  AiDescriptionDto,
  CategoryDto,
  CreateOrderDto,
  LoginDto,
  ProductDto,
  ProofDto,
  RejectDto,
  RegisterDto,
  ShippingUpdateDto,
} from './app.dto';
import { ProductType, Role } from './database/entities';
import { ShopService } from './shop.service';

@Controller()
export class ShopController {
  constructor(private readonly shop: ShopService, private readonly config: ConfigService) {}

  @Post('api/auth/register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() input: RegisterDto) {
    return this.shop.register(input);
  }

  @Post('api/auth/login')
  @Public()
  login(@Body() input: LoginDto) {
    return this.shop.login(input.email, input.password);
  }

  @Get('api/products')
  @Public()
  listProducts(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type', new ParseEnumPipe(ProductType, { optional: true })) type?: ProductType,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.shop.listProducts({
      q,
      categoryId,
      type,
      page: page === undefined ? 0 : Number(page),
      size: size === undefined ? 20 : Number(size),
    });
  }

  @Get('api/products/:id')
  @Public()
  getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shop.getProduct(id);
  }

  @Get('api/categories')
  @Public()
  categories() {
    return this.shop.listCategories();
  }

  @Get('api/recommendations/products/:id')
  @Public()
  recommendationsForProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit = '6',
  ) {
    return this.shop.recommendationsForProduct(id, Number(limit));
  }

  @Get('api/recommendations/me')
  recommendationsForMe(@AuthUser() user: AuthenticatedUser, @Query('limit') limit = '6') {
    return this.shop.recommendationsForUser(user.id, Number(limit));
  }

  @Post('api/orders')
  @HttpCode(HttpStatus.CREATED)
  createOrder(@AuthUser() user: AuthenticatedUser, @Body() input: CreateOrderDto) {
    return this.shop.createOrder(user.id, input);
  }

  @Get('api/orders')
  listOrders(@AuthUser() user: AuthenticatedUser) {
    return this.shop.listOrders(user.id);
  }

  @Get('api/orders/:id')
  getOrder(@AuthUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.shop.getOrder(user.id, id);
  }

  @Post('api/orders/:id/cancel')
  cancelOrder(@AuthUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.shop.cancelOrder(user.id, id);
  }

  @Post('api/orders/:id/payment-proof')
  submitProof(
    @AuthUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: ProofDto,
  ) {
    return this.shop.submitProof(user.id, id, input.transferReference, input.proofUrl);
  }

  @Get('api/orders/:id/downloads')
  downloads(@AuthUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.shop.downloads(user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/products')
  @HttpCode(HttpStatus.CREATED)
  createProduct(@Body() input: ProductDto) {
    return this.shop.createProduct(input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('api/admin/products/:id')
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() input: ProductDto) {
    return this.shop.updateProduct(id, input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('api/admin/products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivateProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shop.deactivateProduct(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Body() input: CategoryDto) {
    return this.shop.createCategory(input.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/products/ai-description')
  aiDescription(@Body() input: AiDescriptionDto) {
    return this.shop.aiDescription(input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('api/admin/payments/pending')
  pendingPayments() {
    return this.shop.pendingPayments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/payments/:id/approve')
  approvePayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.shop.approvePayment(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/payments/:id/reject')
  rejectPayment(@Param('id', ParseUUIDPipe) id: string, @Body() input: RejectDto) {
    return this.shop.rejectPayment(id, input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('api/admin/orders/:id/shipment/retry')
  retryShipment(@Param('id', ParseUUIDPipe) id: string) {
    return this.shop.retryShipment(id);
  }

  @Patch('api/internal/orders/:id/shipping')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateShipping(
    @Req() request: { headers: Record<string, string | undefined> },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ShippingUpdateDto,
  ) {
    const expected = Buffer.from(this.config.get<string>('INTERNAL_KEY', 'dev-internal-key'));
    const supplied = Buffer.from(request.headers['x-internal-key'] ?? '');
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
      throw new UnauthorizedException('Llave interna invalida');
    }
    await this.shop.updateShippingStatus(id, body.status, body.trackingCode);
  }
}
