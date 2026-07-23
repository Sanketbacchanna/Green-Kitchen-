import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Award, Users } from 'lucide-react';

const About = () => {
    const restaurantImg = "/images/green_chicken.png";

    const features = [
        {
            icon: Award,
            title: 'Premium Quality',
            description: 'Only the finest ingredients and authentic spices'
        },
        {
            icon: Users,
            title: 'Head Chef Sanket',
            description: '20+ years of professional expert chief'
        },
        {
            icon: Clock,
            title: 'Fast Delivery',
            description: 'Fresh food delivered within 30-45 minutes'
        }
    ];

    return (
        <div className="min-h-screen bg-light">
            {/* Hero Section */}
            <div className="relative h-96 bg-dark overflow-hidden">
                <img
                    src={restaurantImg}
                    alt="Restaurant"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <h1 className="text-5xl font-bold font-serif mb-4">About Amma's Kitchen</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Serving authentic vegetarian flavors with love and passion.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Our Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h2 className="text-4xl font-bold text-dark mb-6 font-serif text-center">Our Story</h2>
                    <div className="text-gray-800 text-lg leading-relaxed space-y-4 font-medium bg-white/50 p-6 rounded-xl border border-gray-200">
                        <p>
                            "Hello, my name is <span className="text-primary font-bold">Sanket</span>, and I am a professional Chef with over 20 years of experience in the culinary arts.
                        </p>
                        <p>
                            Amma's Kitchen is my dream project, born from a desire to showcase the incredible versatility and flavor of vegetarian cuisine. I believe that healthy food should never compromise on taste."
                        </p>
                        <p>
                            Along with my team, including our Head Chef Sanket, we are dedicated to bringing you the freshest ingredients and the most authentic recipes. Welcome to our family!
                        </p>
                    </div>
                </motion.div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon size={32} className="text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQs */}
                <motion.div
                    id="faqs"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                >
                    <h2 className="text-3xl font-bold text-dark mb-6 text-center font-serif">Frequently Asked Questions</h2>
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold text-dark">Do you offer vegetarian-only food?</h3>
                            <p className="text-sm">Yes, all our dishes are vegetarian and prepared with fresh, homemade ingredients.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-dark">How long does delivery take?</h3>
                            <p className="text-sm">We typically deliver within 30–45 minutes depending on your location.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-dark">Can I order for a family gathering?</h3>
                            <p className="text-sm">Absolutely. We can prepare larger quantities for events and special occasions.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    id="contact"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                >
                    <h2 className="text-3xl font-bold text-dark mb-8 text-center font-serif">Get in Touch</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-dark mb-1">Address</h3>
                                <p className="text-gray-600 text-sm">
                                    123 Food Street, Gourmet District, Bidar, Karnataka - 585401
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="text-primary mt-1 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-dark mb-1">Phone</h3>
                                <p className="text-gray-600 text-sm">+91 9353350845</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="text-primary mt-1 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-dark mb-1">Email</h3>
                                <p className="text-gray-600 text-sm">Sanketbacchanna@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="text-primary mt-1 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-dark mb-1">Hours</h3>
                                <p className="text-gray-600 text-sm">11:00 AM - 11:00 PM</p>
                                <p className="text-gray-600 text-sm">All days of the week</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default About;
