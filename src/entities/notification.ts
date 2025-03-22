import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user";

@Entity({ name: "Notification" })
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ type: 'varchar' })
  messageTitle: string;

  @Column({ type: 'varchar' })
  type: string;

  @ManyToOne(() => User, user => user.sentNotifications, { eager: true })
  @JoinColumn({ name: 'from' }) 
  from: User;

  @ManyToOne(() => User, user => user.receivedNotifications, { eager: true })
  @JoinColumn({ name: 'to' })  
  to: User;


  @Column({ type: "boolean", default: false })
  read: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
