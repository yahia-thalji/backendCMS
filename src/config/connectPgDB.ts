import { DataSource } from "typeorm";
import { Currency } from "../entities/Currency"
import { Item } from "../entities/Item";
import { Invoice } from "../entities/Invoice";
import { Shipment } from "../entities/Shipment";
import { Supplier } from "../entities/Supplier";
import { Location } from "../entities/Location";
import { InternalTransfer } from "../entities/InternalTransfer";


import 'dotenv/config';

export const database = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
    synchronize: true,
    schema: 'public',
    entities: [Currency, Item, Invoice, Shipment, Supplier, Location, InternalTransfer],
    migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],  
    
    // entities: [,],
});

export const initializeDB = async () => {
    try {
        await database.initialize();
        console.log('Database initialized successfully');
    } catch (err:any) {
        console.error('Database initialization failed:', err);
    }
};


