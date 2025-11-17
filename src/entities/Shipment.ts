// src/entities/Shipment.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Supplier } from "./Supplier";
import { Currency } from "./Currency";

@Entity({ name: "shipments" })
export class Shipment extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  containerNumber: string;

  @Column()
  billOfLading: string;

  @ManyToOne(() => Supplier, supplier => supplier.shipments, { nullable: true })
  supplier: Supplier;

  @Column({ type: "timestamp" })
  departureDate: Date;

  @Column({ type: "timestamp", nullable: true })
  arrivalDate: Date;

  @Column({ default: "pending" })
  status: string;

  @Column({ type: "jsonb", nullable: true })
  items: any[];

  @ManyToOne(() => Currency, currency => currency.shipments, { nullable: true })
  currency: Currency;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
