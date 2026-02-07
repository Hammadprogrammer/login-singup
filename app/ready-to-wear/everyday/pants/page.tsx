import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function PantPage() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetSubCategory="EVERYDAY" 
        targetProductType="Pants" 
        pageTitle="Pants" 
      />
    </div>
  );
}
