import { DndContext, DragEndEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import type { Items, Playlist } from "@/types";
import Item from "./Item";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  setItems: React.Dispatch<React.SetStateAction<Playlist[]>>;
  items: Playlist[];
  title: string;
  otherTypeVideos: Playlist[];
};

export default function ItemsList({ setItems, items, title, otherTypeVideos }: Props) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  const queryClient = useQueryClient();
  let type = title === "Playlist" ? "playlists" : "videos";

  function handleDragEnd(e: DragEndEvent, setter: React.Dispatch<React.SetStateAction<Playlist[]>>) {
    const { active, over } = e;

    if (active.id !== over?.id) {
      queryClient.setQueryData<Items>([type], (prev) => {
        if (!prev) return { items: [] };

        let activeIndex = prev?.items.findIndex((item) => item.id === active.id);
        let overIndex = prev?.items.findIndex((item) => item.id === over?.id);
        let items = arrayMove(prev?.items, activeIndex, overIndex);

        localStorage.setItem(type, JSON.stringify(items.map((item) => item.id)));
        setter(items);
        return { items };
      });
    }
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setItems)}>
      {items?.length > 0 && (
        <SortableContext items={items}>
          <>
            {/* if the other type of item doesnt have any items, dont show the title at all */}
            {otherTypeVideos?.length > 0 && (
              <h2 className="text-center font-semibold tracking-wide text-neutral-700 dark:text-zinc-300/90 md:pl-16 md:text-left lg:pl-[5rem] 2xl:pl-[7.5rem]">
                {title}s
              </h2>
            )}
            <div
              className={`mx-auto grid grid-cols-1 place-items-center gap-x-7 gap-y-3 px-12 pt-1 xs:grid-cols-2 md:grid-cols-3 lg:mx-6 lg:grid-cols-4 2xl:mx-14 2xl:grid-cols-5 ${
                title === "Video" && "pb-12"
              }`}
            >
              {items?.map((item) => {
                return <Item key={item.id} id={item.id} duration={item.duration} title={item.title} thumbnails={item.thumbnails} type={title} channel={item.channel} />;
              })}
            </div>
          </>
        </SortableContext>
      )}
    </DndContext>
  );
}
