import ProductTemplate from '../../../../component/contain/ProductTemplate/ProductTemplate';

export default function Page() {
  return (
    <div className="mt-[150px] md:mt-[200px]">
      <ProductTemplate 
        targetCategory="READY TO WEAR" 
        targetProductType="Tunics & Kurtas" 
        pageTitle="All tunics & kurtas" 
      />
    </div>
  );
}
