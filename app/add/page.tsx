import AddExternalItem from "@/components/AddExternalItem";

type searchParams = {
  type: string;
  id: string;
};

export default async function page(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  return <AddExternalItem searchParams={searchParams} />;
}
