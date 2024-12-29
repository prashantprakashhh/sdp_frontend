// import Image from 'next/image';
// import Link from 'next/link';

// const Hero = () => {
//   return (
//     <section className="relative bg-gray-100">
//       <Image
//         src="/images/hero.jpg"
//         alt="Hero Image"
//         layout="responsive"
//         width={1600}
//         height={600}
//         objectFit="cover"
//         priority
//       />
//       <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50">
//         <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Nine11</h1>
//         <p className="text-lg md:text-2xl mb-6">Find the best products at unbeatable prices.</p>
//         <Link  href="/shop">
//           <p className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">Shop Now</p>
//         </Link>
//       </div>
//     </section>
//   );
// };

// export default Hero;

import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative h-[600px] w-full">
      {/* Background Image */}
      <Image
        src="/images/hero.jpg" // Ensure this file exists at 'src/images/hero.jpg'
        alt="Hero Image"
        layout="fill" // Makes the image fill the section
        objectFit="cover" // Ensures the image scales proportionally and covers the entire section
        priority
        className="z-[-1]" // Ensures the image stays in the background
      />
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">Welcome to Nine11</h1>
        <p className="mb-6 text-lg md:text-2xl">
          Find the best products at unbeatable prices.
        </p>
        </div>
        {/* <Link href="/shop">
         <p className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded cursor-pointer">
            Shop Now
          </p> 
        </Link> */}
      
    </section>
  );
};

export default Hero;
