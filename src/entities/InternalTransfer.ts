// src/entities/InternalTransfer.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Location } from "./Location";

@Entity({ name: "internal_transfers" })
export class InternalTransfer extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transferNumber: string;

  @ManyToOne(() => Location, location => location.transfersFrom)
  fromLocation: Location;

  @ManyToOne(() => Location, location => location.transfersTo)
  toLocation: Location;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  transferDate: string;

  @Column({ default: "pending" })
  status: "pending" | "completed" | "cancelled";

  @Column({ type: "jsonb", default: [] })
  items: any[];

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
