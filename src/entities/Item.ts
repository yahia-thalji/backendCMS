// src/entities/Item.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Currency } from "./Currency";
import { Location } from "./Location";
import { Supplier } from "./Supplier";

@Entity({ name: "items" })
export class Item extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: "numeric", default: 0 })
  price: number;

  @Column({ nullable: true })
  category: string;

  @Column({ type: "numeric", nullable: true })
  profitMargin: number;

  @Column({ type: "numeric", nullable: true })
  profitAmount: number;

  @Column({ type: "numeric", nullable: true })
  costPrice: number;

  @ManyToOne(() => Currency, currency => currency.items)
  currency: Currency;

  @ManyToOne(() => Location, location => location.items)
  location: Location;

  @ManyToOne(() => Supplier, supplier => supplier.items)
  supplier: Supplier;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
