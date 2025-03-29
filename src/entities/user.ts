import { 
    BaseEntity, 
    Column, 
    CreateDateColumn, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    OneToMany, 
    OneToOne, 
    PrimaryGeneratedColumn, 
    Relation, 
    UpdateDateColumn 
} from "typeorm";
import { Role } from "./role";
import { Enrollments } from "./enrollments";
import { Assignmentsubmition } from "./assignmentSubmition";
import { Cart } from "./cart";
import { Notification } from "./notification";
import { Reviews } from "./reviews";
import { Resources } from "./resources";
import { CartItem } from "./cartItem";

@Entity({ name: "User" })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    UserID: string;

    @Column({ type: "varchar", length: 25 })
    firstName: string;

    @Column({ type: "varchar", length: 25 })
    lastName: string;

    @Column({ type: "varchar", unique: true, length: 255 })
    email: string;

    @Column({ type: "varchar", nullable: false, unique: true, length: 12 })
    phoneNumber: string;

    @Column({ type: "varchar", length: 100 })
    address: string;

    @Column({ type: "enum", enum: ["male", "female"] })
    gender: "male" | "female";

    @Column({ type: "date" })
    dateOfBirth: Date;

    @Column({ type: "varchar", length: 255 })
    password: string;

    // when we want to change the password account
    @Column({ type: "varchar", nullable: true })
    resetToken?: string;

    @Column({ type: "timestamp", nullable: true })
    resetTokenExpiry?: Date;


    @ManyToOne(() => Role, (role) => role.roleId)
    Role: Relation<Role>;

    @OneToMany(()=>Enrollments , (enrollments)=>enrollments.user)
    enrollments:Enrollments[];

    @OneToMany(()=>Assignmentsubmition , (assignmentsubmition)=>assignmentsubmition.user)
    assignmentsubmition:Assignmentsubmition[];

    @OneToMany(()=>Cart , (cart)=>cart.user)
    cart:Cart[];

    @OneToMany(()=>CartItem ,(cartItem)=>cartItem.user)
    cartItems:CartItem[];
    //notification
    @OneToMany(() => Notification, notification => notification.from)  
    sentNotifications: Notification[];
  
    @OneToMany(() => Notification, notification => notification.to)  
    receivedNotifications: Notification[];

    @OneToMany(() => Reviews, (reviews) => reviews.user)
    reviews: Reviews[];
    
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @OneToOne(() => Resources, (resources) => resources.user, { nullable: true })
    @JoinColumn()
    UserProfilePicture: Resources;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}
