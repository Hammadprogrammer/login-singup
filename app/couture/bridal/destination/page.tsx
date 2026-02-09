import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function Page() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="COUTURE" 
        targetSubCategory="BRIDAL" 
        targetProductType="Destination Wedding" 
        pageTitle="Destination Wedding" 
      />
    </div>
  );
}
