import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function Page() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="COUTURE" 
        targetSubCategory="SEMI-FORMAL" 
        targetProductType="Evening Wear" 
        pageTitle="Evening Wear" 
      />
    </div>
  );
}
