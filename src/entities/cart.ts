import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Product } from './product';
import { CartItem } from './cartItem';

@Entity({ name: "Cart" })
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  cartId: number;

  @Column({ type: "decimal" ,precision: 10, scale: 2 })
  orderTotalPrice: number;

  @Column({ type: "decimal" ,precision: 10, scale: 2 })
  orderDiscountPrice: number;

  @ManyToOne(()=>User, (user)=>user.cart)
  user:User;
  
  @OneToMany(() => Product, (product) => product.cart, { eager: true })
  product: Product[];
  
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
