import { DndContext, DragEndEvent, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import type { Playlist } from "@/types";
import Item from "./Item";
import { getSavedIds, safeSetItem } from "@/utils/safeLocalStorage";
import reorderSavedIds from "@/utils/reorderSavedIds";

type Props = {
  setItems: React.Dispatch<React.SetStateAction<Playlist[]>>;
  items: Playlist[];
  title: "Playlist" | "Video";
  otherTypeVideos: Playlist[];
};

export default function ItemsList({ setItems, items, title, otherTypeVideos }: Props) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {});

  const sensors = useSensors(mouseSensor, touchSensor);

  let type = title === "Playlist" ? "playlists" : "videos";

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    if (!over || active.id === over.id) return;

    const activeIndex = items.findIndex((item) => item.id === active.id);
    const overIndex = items.findIndex((item) => item.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const reordered = arrayMove(items, activeIndex, overIndex);
    const newSavedIds = reorderSavedIds(getSavedIds(type), reordered.map((item) => item.id));
    if (!newSavedIds) return;
    if (!safeSetItem(type, JSON.stringify(newSavedIds))) return;
    setItems(reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {items?.length > 0 && (
        <SortableContext items={items}>
          <>
            {/* if the other type of item doesnt have any items, dont show the title at all */}
            {otherTypeVideos?.length > 0 && (
              <h2 className="text-center font-semibold tracking-wide text-neutral-700 dark:text-zinc-300/90 md:pl-16 md:text-left lg:pl-[80px] 2xl:pl-[120px]">
                {title}s
              </h2>
            )}
            <div
              className={`mx-auto grid grid-cols-1 place-items-center gap-x-8 gap-y-1 px-12 pb-1 pt-1 xs:grid-cols-2 sm:gap-y-3 md:grid-cols-3 lg:mx-6 lg:grid-cols-4 2xl:mx-14 2xl:grid-cols-5 ${
                title === "Video" && "pb-12"
              }`}
            >
              {items?.map((item, index) => {
                return (
                  <Item
                    key={item.id}
                    id={item.id}
                    duration={item.duration}
                    title={item.title}
                    thumbnails={item.thumbnails}
                    type={title}
                    channel={item.channel}
                    priority={index < 4}
                  />
                );
              })}
            </div>
          </>
        </SortableContext>
      )}
    </DndContext>
  );
}
