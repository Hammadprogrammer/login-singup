import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function Page() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetProductType="Matching Sets" 
        pageTitle="All Matching Sets" 
      />
    </div>
  );
}
