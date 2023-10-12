import AddExternalItem from "@/components/AddExternalItem";

type searchParams = {
  type: string;
  id: string;
};

export default async function page({ searchParams }: { searchParams: searchParams }) {
  return <AddExternalItem searchParams={searchParams} />;
}
