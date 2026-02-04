import ProductTemplate from '../../component/contain/ProductTemplate/ProductTemplate';

export default function NewIn() {
  return (
    <div className='mt-[200px]'>
    <ProductTemplate 
      targetCategory="NEW IN" 
      pageTitle="New In"
    />
    </div>
  );
}