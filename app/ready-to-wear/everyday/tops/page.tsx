import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function TopsPage() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetSubCategory="EVERYDAY" 
        targetProductType="Tops" 
        pageTitle="Tops" 
      />
    </div>
  );
}
