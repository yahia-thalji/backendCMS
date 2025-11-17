// src/entities/Supplier.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from "typeorm";

import { Item } from "./Item";
import { Invoice } from "./Invoice";
import { Shipment } from "./Shipment";


@Entity({ name: "suppliers" })
export class Supplier extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Item, item => item.supplier)
  items: Item[];

  @OneToMany(() => Invoice, invoice => invoice.supplier)
  invoices: Invoice[];

  @OneToMany(() => Shipment, shipment => shipment.supplier)
  shipments: Shipment[];
}
