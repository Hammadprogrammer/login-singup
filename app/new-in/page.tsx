import ProductTemplate from '../../component/contain/ProductTemplate/ProductTemplate';

export default function NewIn() {
  return (
    <div className='mt-[150px] md:mt-[200px]'>
    <ProductTemplate 
      targetCategory="NEW IN" 
      pageTitle="New In"
    />
    </div>
  );
} 

// import ProductTemplate from '../../component/contain/ProductTemplate/ProductTemplate';

// export default function KaftansPage() {
//   return (
//     <div className="mt-48">
//       <ProductTemplate 
//         targetCategory="READY TO WEAR" 
//         targetSubCategory="EVERYDAY" 
//         targetProductType="Kaftans" 
//         pageTitle="Luxury Kaftans" 
//       />
//     </div>
//   );
// }