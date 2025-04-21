"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Faster stagger for quicker load
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(59, 130, 246, 0.4)", // Softer shadow
    transition: {
      duration: 0.2,
      // Removed yoyo for less distraction
    },
  },
  tap: {
    scale: 0.95,
  },
};

const featureCardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
};

const testimonialVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99], // Custom ease for a nice pop
    },
  },
};

// Simple Navbar Component (can be extracted later)
const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-80 backdrop-blur-md shadow-sm z-50">
    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-green-600">
        Green Lens
      </Link>
      <div className="space-x-4">
        <Link
          href="/login"
          className="text-gray-600 hover:text-blue-500 transition duration-200"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
        >
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 text-gray-800 overflow-x-hidden pt-16">
      {" "}
      {/* Added padding-top for fixed navbar */}
      <Navbar />
      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-6 py-20 md:py-28 text-center flex flex-col items-center relative isolate" // Added isolate for stacking context
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Optional: Subtle background shapes */}
        <div
          className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
          aria-hidden="true"
        >
          <div
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80ff89] to-[#00c6ff] opacity-20 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-500 to-purple-600"
          variants={itemVariants}
        >
          Visualize a Greener Tomorrow
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl" // Increased max-width
          variants={itemVariants}
        >
          Join Green Lens: Capture environmental moments, track changes with
          location data, and contribute to a global effort for a sustainable
          future. Simple uploads, powerful insights.
        </motion.p>
        <motion.div variants={itemVariants}>
          <motion.div // Wrap Link with motion.div for animation variants
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="inline-block" // Ensure motion div behaves like the link
          >
            <Link
              href="/upload"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition duration-300 ease-in-out text-lg block" // Use block display if needed or adjust parent
            >
              Start Capturing
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
      {/* Features Section */}
      <section className="py-20 bg-white shadow-inner">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-700">
            How It Works
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10" // Increased gap
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }} // Trigger slightly earlier
            transition={{ staggerChildren: 0.2 }}
          >
            {/* Feature Card 1 */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-md border border-gray-200 flex flex-col items-center" // Increased padding, rounded-xl
              variants={featureCardVariants}
              whileHover="hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-blue-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5} // Thinner stroke
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-center">
                1. Capture & Upload
              </h3>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Use our intuitive interface to take pictures directly through
                your device or upload existing ones.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-md border border-gray-200 flex flex-col items-center"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-green-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-center">
                2. Location Tagging
              </h3>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Your uploads are automatically geotagged, providing valuable
                context for environmental analysis.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-md border border-gray-200 flex flex-col items-center"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-purple-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-center">
                3. Contribute & Analyze
              </h3>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Admins review data, and together we build a visual database for
                monitoring our planet&apos;s health.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Testimonial Section (Example) */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-700">
            Making a Difference
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
            Hear from users who are contributing to a greener world with Green
            Lens.
          </p>
          <motion.div
            className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200"
            variants={testimonialVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <p className="text-gray-600 italic mb-4">
              &ldquo;Green Lens makes it so easy to document environmental
              changes I see in my local park. It feels good to contribute to
              something bigger!&rdquo;
            </p>
            <p className="font-semibold text-gray-800">- Alex Johnson</p>
            <p className="text-sm text-gray-500">Community Scientist</p>
          </motion.div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Make an Impact?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Sign up today and start capturing the world around you. Every image
            counts towards a better understanding of our environment.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div // Wrap Link with motion.div for animation variants
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="inline-block" // Ensure motion div behaves like the link
            >
              <Link
                href="/signup"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transition duration-300 ease-in-out text-lg block" // Use block display if needed or adjust parent
              >
                Join Green Lens Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm bg-gray-100">
        &copy; {new Date().getFullYear()} Green Lens. All rights reserved. |{" "}
        <Link href="/privacy" className="hover:text-blue-500">
          Privacy Policy
        </Link>{" "}
        |{" "}
        <Link href="/terms" className="hover:text-blue-500">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
