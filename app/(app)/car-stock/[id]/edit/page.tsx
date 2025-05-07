import { CarStockEditLayout } from "@/components/app/stock/edit/CarStockEditLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function CarStockEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void trpc.carStock.getById.prefetch({ id });
  return (
    <HydrateClient>
      <CarStockEditLayout id={id} />
    </HydrateClient>
  );
}
