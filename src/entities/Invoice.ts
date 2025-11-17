// src/entities/Invoice.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Supplier } from "./Supplier";
import { Currency } from "./Currency";

@Entity({ name: "invoices" })
export class Invoice extends BaseEntity{
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @ManyToOne(() => Supplier, supplier => supplier.invoices, { nullable: true })
  supplier: Supplier;

  @Column({ type: "timestamp" })
  issueDate: Date;

  @Column({ type: "timestamp" })
  dueDate: Date;

  @Column({ type: "numeric", default: 0 })
  totalAmount: number;

  @Column({ default: "draft" })
  status: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: "jsonb", default: [] })
  items: any[];

  @ManyToOne(() => Currency, currency => currency.invoices, { nullable: true })
  currency: Currency;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
