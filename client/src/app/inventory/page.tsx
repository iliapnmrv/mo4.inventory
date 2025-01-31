"use client";

import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import InventoryReport from "components/InventoryReport/InventoryReport";
import InventoryScanned from "components/InventoryScanned/InventoryScanned";
import moment from "moment";
import { useSnackbar } from "notistack";
import { useState } from "react";
import {
  useGetInventoryQuery,
  useGetLatestInventoryQuery,
  useUploadInventoryMutation,
} from "redux/inventory/inventory.api";
import { IException } from "src/types/types";

const Inventory = () => {
  const { data: inventory } = useGetInventoryQuery();

  const [
    uploadInventory,
    { error: latestInventoryError, isLoading: latestInventoryLoading },
  ] = useUploadInventoryMutation();
  const { data: latestInventory } = useGetLatestInventoryQuery();

  const [showReport, setShowReport] = useState<boolean>(false);
  const [showScanned, setShowScanned] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleInventoryUpload = async (inventory: File) => {
    try {
      const formData = new FormData();
      formData.append("inventory", inventory);

      const response = await uploadInventory(formData).unwrap();
      enqueueSnackbar("Инвентаризация загружена", {
        variant: "success",
      });
    } catch (e) {
      enqueueSnackbar((e as IException)?.data?.message, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box>
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUploadOutlinedIcon />}
            sx={{ mr: 1 }}
          >
            Загрузить контрольную таблицу
            <input
              hidden
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              multiple
              type="file"
              onChange={(e) => {
                handleInventoryUpload(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </Button>
          {latestInventory?.name} -{" "}
          {moment(latestInventory?.upload_date).format("LLL")}
        </Box>
        <Button variant="text" onClick={() => setShowReport(true)}>
          Результаты инвентаризации
        </Button>
        <Button variant="text" onClick={() => setShowScanned(true)}>
          Журнал инвентаризации
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>№ в ведомости</TableCell>
              <TableCell>Наименование</TableCell>
              <TableCell align="right">Место</TableCell>
              <TableCell align="right">Количество</TableCell>
              <TableCell align="right">Приоритет</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory?.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell scope="row">{row.vedpos}</TableCell>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.place}</TableCell>
                <TableCell align="right">{row.kolvo}</TableCell>
                <TableCell align="right">{row.place_priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <InventoryReport open={showReport} setOpen={setShowReport} />
      <InventoryScanned open={showScanned} setOpen={setShowScanned} />
    </>
  );
};

export default Inventory;
