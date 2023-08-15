// import { DndContext, DragEndEvent, MouseSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
// import { SortableContext, arrayMove } from "@dnd-kit/sortable";

// import { Playlist } from "@/types";
// import Item from "./Item";

// type Props = {
//   setItems: React.Dispatch<React.SetStateAction<Playlist[]>>;
//   items: Playlist[];
//   title: string;
//   otherTypeVideos: Playlist[];
// };

// export default function ItemsList({ setItems, items, title, otherTypeVideos }: Props) {
//   const pointerSensor = useSensor(PointerSensor, {
//     activationConstraint: {
//       distance: 8,
//     },
//   });
//   const touchSensor = useSensor(TouchSensor, {
//     // Press delay of 250ms, with tolerance of 5px of movement.
//     activationConstraint: {
//       delay: 250,
//       tolerance: 5,
//     },
//   });

//   const sensors = useSensors(pointerSensor, touchSensor);

//   function handleDragEnd(e: DragEndEvent, setter: React.Dispatch<React.SetStateAction<Playlist[]>>) {
//     const { active, over } = e;

//     if (active.id !== over?.id) {
//       setter((items) => {
//         let activeIndex = items.findIndex((item) => item.id === active.id);
//         let overIndex = items.findIndex((item) => item.id === over?.id);

//         return arrayMove(items, activeIndex, overIndex);
//       });
//     }
//   }

//   return (
//     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setItems)}>
//       {items?.length > 0 && (
//         <SortableContext items={items}>
//           <>
//             {/* if the other type doesnt have any items, dont show the title at all */}
//             {otherTypeVideos?.length > 0 && (
//               <h2 className="sm:pl-24 xs:pl-16 xl:pl-24 text-center xs:text-left mt-4 2xl:mt-5 text-neutral-700 dark:text-zinc-300/90   font-semibold tracking-wide">
//                 {title}s
//               </h2>
//             )}
//             <div className="pl-3 sm:pl-7 pt-1 2xl:pt-3 grid grid-cols-1 gap-y-2  xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
//               {items?.map((playlist) => (
//                 <Item key={playlist.id} id={playlist.id} title={playlist.snippet.title} thumbnail={playlist.snippet.thumbnails} type={title} setOnDelete={setItems} />
//               ))}
//             </div>
//           </>
//         </SortableContext>
//       )}
//     </DndContext>
//   );
// }

import { DndContext, DragEndEvent, MouseSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

import { Playlist } from "@/types";
import Item from "./Item";

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
    // Press delay of 250ms, with tolerance of 5px of movement.
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  function handleDragEnd(e: DragEndEvent, setter: React.Dispatch<React.SetStateAction<Playlist[]>>) {
    const { active, over } = e;

    if (active.id !== over?.id) {
      setter((items) => {
        let activeIndex = items.findIndex((item) => item.id === active.id);
        let overIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, activeIndex, overIndex);
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setItems)}>
      {items?.length > 0 && (
        <SortableContext items={items}>
          <>
            {/* if the other type doesnt have any items, dont show the title at all */}
            {otherTypeVideos?.length > 0 && (
              <h2 className="sm:pl-24 xs:pl-16 xl:pl-24 text-center xs:text-left mt-4 2xl:mt-5 text-neutral-700 dark:text-zinc-300/90   font-semibold tracking-wide">
                {title}s
              </h2>
            )}
            <div className="pl-3 sm:pl-7 pt-1 2xl:pt-3 grid grid-cols-1 gap-y-2  xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
              {items?.map((playlist) => (
                <Item key={playlist.id} id={playlist.id} title={playlist.snippet.title} thumbnail={playlist.snippet.thumbnails} type={title} setOnDelete={setItems} />
              ))}
            </div>
          </>
        </SortableContext>
      )}
    </DndContext>
  );
}
