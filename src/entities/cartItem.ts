import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
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
  @RelationId((cartItem: CartItem) => cartItem.cart)
  cartId: number;

  @ManyToOne(() => Product, (product) => product.cartItems ,{ onDelete: "CASCADE" })
  product: Product;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: [ 'inCart','pending','accept' ,'rejected'] ,default:'inCart'},)
  status: 'pending' | 'inCart' | 'accept' |'rejected' ;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt:Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt:Date;

}
