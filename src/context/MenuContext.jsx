import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuItems as defaultMenuItems, menuCategories } from '../data/menuData';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState(() => {
        const savedMenu = localStorage.getItem('ammas_kitchen_menu');
        return savedMenu ? JSON.parse(savedMenu) : defaultMenuItems;
    });

    // Save to local storage whenever menuItems change
    useEffect(() => {
        localStorage.setItem('ammas_kitchen_menu', JSON.stringify(menuItems));
    }, [menuItems]);

    const addMenuItem = (newItem) => {
        const itemWithId = {
            ...newItem,
            id: Date.now(), // simple unique id generator
        };
        setMenuItems((prev) => [...prev, itemWithId]);
    };

    const updateMenuItem = (id, updatedData) => {
        setMenuItems((prev) => 
            prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
        );
    };

    const deleteMenuItem = (id) => {
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <MenuContext.Provider value={{ menuItems, menuCategories, addMenuItem, updateMenuItem, deleteMenuItem }}>
            {children}
        </MenuContext.Provider>
    );
};
