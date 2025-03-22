import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({name:"Role"})
export class Role extends BaseEntity{
    @PrimaryGeneratedColumn()
    roleId:number;

    @Column({type:"enum" , enum:['user' , 'admin'],default :'user'})
    roleName:string;
}