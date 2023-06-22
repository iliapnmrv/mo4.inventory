import { Button, TableCell, TableRow } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { IItem, usePrefetch } from "redux/item/item.api";
import { QRzeros, removeBasepathFromPathname } from "src/utils/utils";
import Checkbox from "./Checkbox";
import Link from "next/link";

type Props = {
  item: IItem;
  showPlace: boolean;
  showCheckboxes?: boolean;
};

const Row = ({ item, showPlace, showCheckboxes = true }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const prefetchItem = usePrefetch("getItem");

  return (
    <TableRow
      sx={{ maxWidth: 1000 }}
      key={item.id}
      onMouseEnter={() => prefetchItem(item.qr)}
      onClick={() =>
        router.push(
          `${removeBasepathFromPathname(pathname)}/?qr=${
            item.qr
          }&type=edit&modalType=qr`
        )
      }
    >
      {showCheckboxes ? (
        <TableCell>
          <Checkbox qr={item.qr} model={item.model} />
        </TableCell>
      ) : null}
      <TableCell>
        <Button variant="text">{QRzeros(item.qr)}</Button>
      </TableCell>
      <TableCell>{showPlace ? item?.place?.name : item?.name}</TableCell>
      <TableCell>{item.model}</TableCell>
      <TableCell>{item.device?.name}</TableCell>
      <TableCell>{item.person?.name}</TableCell>
      <TableCell>{item.status?.name}</TableCell>
      <TableCell
        sx={{
          width: 90,
          hyphens: "auto",
          msHyphens: "auto",
          MozHyphens: "auto",
          WebkitHyphens: "auto",
        }}
      >
        {item.user?.name}
      </TableCell>
    </TableRow>
  );
};

export default memo(Row);
