import {supabase} from '../lib/supabase'
import type { Product } from '../types/db'

export async function getProducts(): Promise<Product[]>{
    const {data,error} = await supabase.from('products').select('*')

    if(error) throw error
    return data
}