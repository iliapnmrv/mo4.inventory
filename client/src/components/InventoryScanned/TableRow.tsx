import { Button, TableCell, TableRow } from "@mui/material";
import moment from "moment";
import { FC } from "react";
import { InventoryScan } from "redux/inventory/inventory.api";
import { QRzeros, removeBasepathFromPathname } from "src/utils/utils";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  item: InventoryScan;
};

const Row: FC<Props> = ({ item }) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>{item.id}</TableCell>
        <TableCell>
          <Button
            onClick={() =>
              router.push(
                `${removeBasepathFromPathname(pathname)}/?qr=${
                  item.inventoryNum
                }&type=edit&modalType=qr`
              )
            }
            variant="text"
          >
            {QRzeros(item.inventoryNum)}
          </Button>
        </TableCell>
        <TableCell component="th" scope="item">
          {item.name === "Не в учете" ? item.model : item.name}
        </TableCell>
        <TableCell component="th" scope="item">
          {item.position} / {item.place}
        </TableCell>
        <TableCell>
          {item.status === 1 && "В учете"}
          {item.status === 2 && "Не в учете"}
          {item.status === 3 && "Сверх учета"}
          {item.status === 4 && "Повторное сканирование"}
        </TableCell>
        <TableCell>
          {moment(item.createdAt).format("DD.MM.YYYY HH:mm:ss")}
        </TableCell>
      </TableRow>
    </>
  );
};

export default Row;
