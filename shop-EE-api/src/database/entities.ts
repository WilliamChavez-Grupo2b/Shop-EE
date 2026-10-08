import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_REVIEW = 'PAYMENT_REVIEW',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  AWAITING_TRANSFER = 'AWAITING_TRANSFER',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column() fullName: string;
  @Column({ type: 'varchar', default: Role.CUSTOMER }) role: Role;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @OneToMany(() => Product, (product) => product.category) products: Product[];
}

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @VersionColumn() version: number;
  @Column({ unique: true }) sku: string;
  @Column() name: string;
  @Column({ type: 'varchar', length: 4000, nullable: true }) description: string | null;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) price: string;
  @Column({ type: 'varchar', default: ProductType.PHYSICAL }) type: ProductType;
  @Column({ type: 'integer', nullable: true }) stock: number | null;
  @Column({ nullable: true }) digitalFileUrl: string | null;
  @Column({ nullable: true }) imageUrl: string | null;
  @Column({ default: true }) active: boolean;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  category: Category | null;
  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true, orphanedRowAction: 'delete' })
  variants: ProductVariant[];
}

@Entity('product_variant')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @VersionColumn() version: number;
  @ManyToOne(() => Product, (product) => product.variants, { nullable: false, onDelete: 'CASCADE' })
  product: Product;
  @Column() name: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) priceDelta: string;
  @Column({ type: 'integer', nullable: true }) stock: number | null;
}

@Entity('orders')
export class ShopOrder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { nullable: false }) user: User;
  @Column({ type: 'varchar', default: OrderStatus.PENDING_PAYMENT }) status: OrderStatus;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) total: string;
  @Column({ nullable: true }) shippingAddress: string | null;
  @Column({ type: 'varchar', length: 1000, nullable: true }) notes: string | null;
  @Column({ nullable: true }) shipmentId: string | null;
  @Column({ nullable: true }) trackingCode: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => ShopOrder, (order) => order.items, { onDelete: 'CASCADE' })
  order: ShopOrder;
  @ManyToOne(() => Product, { nullable: false }) product: Product;
  @ManyToOne(() => ProductVariant, { nullable: true }) variant: ProductVariant | null;
  @Column({ type: 'integer' }) quantity: number;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) unitPrice: string;
}

@Entity('transfer_payment')
export class TransferPayment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @OneToOne(() => ShopOrder, { nullable: false })
  @JoinColumn()
  order: ShopOrder;
  @Column({ unique: true }) referenceCode: string;
  @Column({ type: 'varchar', default: PaymentStatus.AWAITING_TRANSFER })
  status: PaymentStatus;
  @Column({ nullable: true }) transferReference: string | null;
  @Column({ nullable: true }) proofUrl: string | null;
  @Column({ nullable: true }) rejectionReason: string | null;
  @Column({ type: 'timestamptz', nullable: true }) submittedAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) reviewedAt: Date | null;
}
