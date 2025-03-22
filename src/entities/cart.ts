import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Product } from './product';

@Entity({ name: "Cart" })
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  cartId: number;

  @Column({ type: "decimal" })
  orderTotalPrice: number;

  @Column({ type: "decimal" })
  orderDiscountPrice: number;

  @Column({ type: 'decimal' })
  quantity: number;

  @Column({ type: 'enum', enum: ['accept', 'rejected', 'pending'] })
  status: 'accept' | 'rejected' | 'pending';

  @ManyToOne(()=>User, (user)=>user.cart)
  user:User;
  
  @ManyToOne(() => Product, (product) => product.cart, { eager: true })
  product: Product;
  
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
