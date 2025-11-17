// src/entities/Location.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from "typeorm";
import { Item } from "./Item";
import { InternalTransfer } from "./InternalTransfer";

@Entity({ name: "locations" })
export class Location extends BaseEntity {
    @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 0 })
  capacity: number;

  @Column({ default: 0 })
  currentUsage: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Item, item => item.location)
  items: Item[];

  @OneToMany(() => InternalTransfer, transfer => transfer.fromLocation)
  transfersFrom: InternalTransfer[];

  @OneToMany(() => InternalTransfer, transfer => transfer.toLocation)
  transfersTo: InternalTransfer[];
}
