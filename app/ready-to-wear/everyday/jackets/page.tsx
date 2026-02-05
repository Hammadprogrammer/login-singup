import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function Jackets() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetSubCategory="EVERYDAY" 
        targetProductType="Jackets" 
        pageTitle="Jackets" 
      />
    </div>
  );
}
