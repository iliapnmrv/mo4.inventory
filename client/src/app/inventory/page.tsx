"use client";

import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  useGetInventoryQuery,
  useGetInventoryReportQuery,
  useGetLatestInventoryQuery,
  useUploadInventoryMutation,
} from "redux/inventory/inventory.api";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import moment from "moment";
import { IException } from "src/types/types";
import { useSnackbar } from "notistack";
import InventoryReport from "components/InventoryReport/InventoryReport";
import Link from "next/link";

const Inventory = () => {
  const { data: inventory } = useGetInventoryQuery();

  const [
    uploadInventory,
    { error: latestInventoryError, isLoading: latestInventoryLoading },
  ] = useUploadInventoryMutation();
  const { data: latestInventory } = useGetLatestInventoryQuery();

  const [showReport, setShowReport] = useState<boolean>(false);

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
        <Link href={{ query: { modal: "results" }, pathname: "/inventory" }}>
          <Button variant="text" onClick={() => setShowReport(true)}>
            Результаты инвентаризации
          </Button>
        </Link>
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
    </>
  );
};

export default Inventory;
