// src/entities/Currency.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany , BaseEntity} from "typeorm";
import { Item } from "./Item";
import { Invoice } from "./Invoice";
import { Shipment } from "./Shipment";

@Entity({ name: "currencies" })
export class Currency extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  symbol: string;

  @Column({ type: "float", default: 1 })
  exchangeRate: number;

  @Column()
  isBase: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Item, item => item.currency)
  items: Item[];

  @OneToMany(() => Invoice, invoice => invoice.currency)
  invoices: Invoice[];

  @OneToMany(() => Shipment, shipment => shipment.currency)
  shipments: Shipment[];
}
