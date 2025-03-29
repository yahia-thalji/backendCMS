import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Cart } from "./cart";
import { Product } from "./product";
import { User } from "./user";

@Entity({ name: "CartItem" })
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(()=>User , (user)=> user.cartItems ,{ onDelete: "CASCADE" } )
  user:User;
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems ,{ onDelete: "CASCADE" })
  product: Product;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: [ 'pending','inCart'] ,default:'inCart'},)
  status: 'pending' | 'inCart';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt:Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt:Date;
}
