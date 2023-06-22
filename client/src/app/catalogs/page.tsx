"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Divider,
  Fab,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CatalogModal from "components/Catalogs/CatalogModal";
import NotAvailableModal from "components/Catalogs/NotAvailableCatalogModal";
import AlertDialog from "components/Dialog/Dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import {
  ICatalogs,
  useDeleteCatalogMutation,
  useGetAvailableMutation,
  useGetCatalogsQuery,
} from "redux/catalog/catalog.api";
import { CatalogNames } from "src/constants/translations";

const Catalogs = () => {
  const { data: catalogs } = useGetCatalogsQuery();

  const [catalog, setCatalog] = useState<ICatalogs>("place");
  const [deleteCatalog] = useDeleteCatalogMutation();
  const [getAvailable, { data: available }] = useGetAvailableMutation();

  const [deleteCatalogId, setDeleteCatalogId] = useState<number>(0);
  const [notAvailableModal, setNotAvailableModal] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const modalType: "edit" | "create" | any = searchParams.get("modal");
  const catalogId = +searchParams.get("id");

  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event: React.SyntheticEvent, newCatalog: ICatalogs) => {
    if (newCatalog !== null) {
      setCatalog(newCatalog);
    }
  };

  const onDeleteCatalog = async () => {
    try {
      await deleteCatalog({
        catalog,
        id: deleteCatalogId,
      }).unwrap();
      setDeleteCatalogId(0);
      enqueueSnackbar("Позиция удалена", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Произошла ошибка", { variant: "error" });
    }
  };

  const findAvailableToDelete = async (id: number) => {
    const available = await getAvailable({
      catalog,
      id,
    }).unwrap();
    if (available?.data) {
      setNotAvailableModal(true);
    } else {
      setDeleteCatalogId(id);
    }
  };

  const router = useRouter();

  return (
    <>
      <ToggleButtonGroup
        color="primary"
        value={catalog}
        exclusive
        onChange={handleChange}
        aria-label="catalogs"
      >
        <ToggleButton value="place">Местоположения</ToggleButton>
        <ToggleButton value="person">МОЛы</ToggleButton>
        <ToggleButton value="type">Средства</ToggleButton>
        <ToggleButton value="device">Устройства</ToggleButton>
        <ToggleButton value="user">Пользователи</ToggleButton>
        <ToggleButton value="status">Статусы</ToggleButton>
        <ToggleButton value="stock_device">Устройства (Склад)</ToggleButton>
      </ToggleButtonGroup>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell align="left">Значение</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {catalogs?.[catalog]?.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell align="left">{row.name}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    divider={<Divider orientation="vertical" flexItem />}
                    spacing={1}
                  >
                    <IconButton
                      aria-label="edit"
                      onClick={() => {
                        router.push(`/catalogs?id=${row.id}&modal=edit`);
                      }}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => findAvailableToDelete(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CatalogModal
        defaultValue={
          catalogs?.[catalog]?.find((item) => item.id === catalogId)?.name
        }
        catalogType={catalog}
        catalogId={catalogId}
        onClose={router.back}
        type={modalType}
      />
      <NotAvailableModal
        open={notAvailableModal}
        setOpen={setNotAvailableModal}
        items={available?.data ?? []}
      />
      <Fab
        color="primary"
        sx={{
          zIndex: 10,
          margin: 0,
          top: "auto",
          right: 20,
          bottom: 20,
          left: "auto",
          position: "fixed",
        }}
        onClick={() => {
          router.push(`/catalogs?modal=create`);
        }}
        aria-label="add"
      >
        <AddIcon />
      </Fab>
      <AlertDialog
        open={!!deleteCatalogId}
        handleClose={() => setDeleteCatalogId(0)}
        text={`Удалить ${CatalogNames[catalog]} с наименованием ${
          catalogs?.[catalog]?.find((item) => item.id === deleteCatalogId)?.name
        }`}
        confirmAction={onDeleteCatalog}
        confirmText={"Да, удалить"}
      />
    </>
  );
};

export default Catalogs;
