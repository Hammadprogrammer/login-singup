import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function AllPage() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetSubCategory="EVERYDAY" 
        pageTitle="All" 
      />
    </div>
  );
}
