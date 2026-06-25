import { db } from '../firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

const products = [
    { name: "Arai RX-7V Racing Helmet", price: 849.99, rating: 5, image: "https://images.unsplash.com/photo-1618355242364-28c1c201460a?auto=format&fit=crop&q=80&w=600", badge: "Sale", category: "Helmets" },
    { name: "Alpinestars Misano Leather Jacket", price: 599.00, rating: 4.8, image: "https://images.unsplash.com/photo-1544441893-675973e31d85?auto=format&fit=crop&q=80&w=600", badge: "New", category: "Jackets" }
];

const categories = [
    { name: "Helmets", slug: "helmets", count: "15 items", image: "https://images.unsplash.com/photo-1618355242364-28c1c201460a?auto=format&fit=crop&q=80&w=800" },
    { name: "Jackets", slug: "jackets", count: "25 items", image: "https://images.unsplash.com/photo-1544441893-675973e31d85?auto=format&fit=crop&q=80&w=800" }
];

const offers = [
    { title: "Summer Track Day Sale: Up to 40% Off", link: "/helmets", image: "https://images.unsplash.com/photo-1620574387735-3644917ed687?auto=format&fit=crop&q=80&w=1200" }
];

const brands = [
    { name: "Alpinestars", logo: "https://brandslogo.net/wp-content/uploads/2014/10/alpinestars-logo.png" },
    { name: "Dainese", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dainese_logo.svg/1200px-Dainese_logo.svg.png" },
    { name: "Arai", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Arai_Logo.svg/1200px-Arai_Logo.svg.png" }
];

const bikes = [
    { name: "Ducati Panigale V4", description: "The pinnacle of Italian performance and design.", image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800" },
    { name: "BMW S1000RR", description: "Precision engineering for the ultimate track experience.", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800" }
];

const adminUser = {
    email: "gearnext985@gmail.com",
    password: "NextGear$123.",
    role: "admin"
};

export const seedDatabase = async () => {
    try {
        const collections = [
            { name: "products", data: products },
            { name: "categories", data: categories },
            { name: "offers", data: offers },
            { name: "brands", data: brands },
            { name: "bikes", data: bikes }
        ];

        for (const col of collections) {
            const ref = collection(db, col.name);
            const snap = await getDocs(ref);
            if (snap.empty) {
                for (const item of col.data) { await addDoc(ref, item); }
                console.log(`${col.name} seeded!`);
            }
        }

        const userRef = collection(db, "users");
        const userQuery = query(userRef, where("email", "==", adminUser.email));
        const userSnap = await getDocs(userQuery);
        if (userSnap.empty) { await addDoc(userRef, adminUser); }

        alert("Database seeded successfully with all 5 sections!");
    } catch (e) {
        console.error(e);
        alert("Error seeding database.");
    }
};
