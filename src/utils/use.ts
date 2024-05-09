import { useState } from "react";

export function useLoading<T extends any[], R>(
  action: (...args: T) => Promise<R>
): [boolean, (...args: T) => Promise<R>] {
  const [loading, setLoading] = useState<boolean>(false);

  const doAction = async (...args: T) => {
    setLoading(true);
    const res = await action(...args);
    setLoading(false);
    return res;
  };

  return [loading, doAction];
}

// export const isMobile = useMediaQuery("(max-width: 599px)");

// export const useSwitch = (initValue = false) => {
//     const visible = ref(initValue);

//     return reactive({
//         on: visible,
//         open: () => visible.value = true,
//         close: () => visible.value = false,
//         toggle: () => visible.value = !visible.value,
//     });
// }

// export const useFormModel = () => {
//     const model = ref<FormModel | null>(null);
//     const validate = async () => {
//         if (!model.value) return false;
//         return new Promise<boolean>((res) => {
//             model.value!.validate((valid) => {
//                 res(valid)
//             });
//         });
//     }
//     return [
//         model,
//         { validate },
//     ] as const;
// }

// export const useMutex = () => {

//     const locking = ref(false);

//     const lock = <T extends any[]>(action: (...args: T) => Promise<void>) => {

//         return async (...args: T) => {
//             if (locking.value) {
//                 return;
//             }
//             locking.value = true;
//             await action(...args);
//             locking.value = false;
//         };
//     };

//     return [lock, readonly(locking)] as const;
// };
