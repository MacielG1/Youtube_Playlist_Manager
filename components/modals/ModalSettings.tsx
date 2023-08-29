// import { createPortal } from "react-dom";

// type ModalSettingsProps = {
//   onClose: () => void;
//   content: React.ReactNode;
// };

// export default function ModalSettings({ onClose, content }: ModalSettingsProps) {
//   let modal = (
//     <>
//       {/* Backdrop */}
//       <div className=" fixed top-0 left-0 w-full h-[100vh] z-20 bg-black bg-opacity-60" onClick={onClose} />;
//       <>
//         {/* Modal */}
//         <div
//           className="absolute top-14 right-10 w-fit flex flex-col p-4 gap-2 mt-1 bg-neutral-300 dark:bg-zinc-700  rounded-lg shadow-md z-30
//       max-[350px]:right-1 max-[350px]:p-1 max-[350px]:text-base max-[350px]:w-[95%] "
//         >
//           {content}
//         </div>
//       </>
//     </>
//   );
//   return createPortal(modal, document.getElementById("modal-root") as HTMLElement);
// }

import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalSettings({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button type="button" className="cursor-default fixed top-0 left-0 w-full h-[100vh] z-20 bg-black bg-opacity-60" onClick={onClose} />
      <>
        {/* Modal */}
        <div
          className="absolute top-14 right-10 w-fit flex flex-col p-4 gap-2 mt-1 bg-neutral-300 dark:bg-zinc-700  rounded-lg shadow-md z-30
       max-[350px]:right-1 max-[350px]:p-1 max-[350px]:text-base max-[350px]:w-[95%]"
        >
          {content}
        </div>
      </>
    </>
  );
  return createPortal(modal, document.getElementById("modal-root") as HTMLElement);
}
