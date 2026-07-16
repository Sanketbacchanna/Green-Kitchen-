import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { menuItems as defaultMenuItems, menuCategories } from '../data/menuData';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error("Error fetching menu items:", error.message);
                // Fallback to local storage or defaults if table isn't ready
                const savedMenu = localStorage.getItem('ammas_kitchen_menu');
                setMenuItems(savedMenu ? JSON.parse(savedMenu) : defaultMenuItems);
            } else if (data && data.length > 0) {
                setMenuItems(data);
            } else {
                // Database is empty, use default items and push to db
                seedDatabase();
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const seedDatabase = async () => {
        const { error } = await supabase.from('menu_items').insert(defaultMenuItems);
        if (!error) {
            setMenuItems(defaultMenuItems);
        } else {
            console.error("Error seeding database:", error.message);
            setMenuItems(defaultMenuItems);
        }
    };

    const addMenuItem = async (newItem) => {
        const itemWithId = {
            ...newItem,
            id: Date.now(), // Keep unique id generator
        };
        // Optimistic UI update (shows up instantly for user)
        setMenuItems((prev) => [...prev, itemWithId]);
        
        // Save to Supabase Cloud
        const { error } = await supabase.from('menu_items').insert([itemWithId]);
        if (error) {
            console.error("Error adding item to Supabase:", error.message);
        }
    };

    const updateMenuItem = async (id, updatedData) => {
        // Optimistic UI update
        setMenuItems((prev) => 
            prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
        );

        // Update in Supabase Cloud
        const { error } = await supabase
            .from('menu_items')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            console.error("Error updating item in Supabase:", error.message);
        }
    };

    const deleteMenuItem = async (id) => {
        // Optimistic UI update
        setMenuItems((prev) => prev.filter((item) => item.id !== id));

        // Delete from Supabase Cloud
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting item from Supabase:", error.message);
        }
    };

    return (
        <MenuContext.Provider value={{ menuItems, menuCategories, addMenuItem, updateMenuItem, deleteMenuItem, loading }}>
            {children}
        </MenuContext.Provider>
    );
};
