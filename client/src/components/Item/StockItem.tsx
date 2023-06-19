"use client";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Modal,
  NativeSelect,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import AlertDialog from "components/Dialog/Dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useGetCatalogsQuery } from "redux/catalog/catalog.api";
import {
  Stock,
  useCreateStockMutation,
  useLazyGetStockItemQuery,
  useDeleteStockMutation,
  useUpdateStockMutation,
} from "redux/stock/stock.api";
import { ItemNames } from "src/constants/translations";
import { convertIntObj } from "src/utils/utils";

type StockFields = Pick<
  Stock,
  "description" | "device_id" | "name" | "quantity"
>;

const StockItem = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState(0);

  const id = +searchParams.get("stockId");
  const type = searchParams.get("type");
  const modalType = searchParams.get("modalType");

  const [getStock, { data: item }] = useLazyGetStockItemQuery();
  const [deleteStock] = useDeleteStockMutation();
  const [updateStock] = useUpdateStockMutation();
  const [createStock] = useCreateStockMutation();

  const { data: catalogs } = useGetCatalogsQuery();

  const findStock = async (id: number) => {
    const stock = await getStock(id).unwrap();
    reset(stock);
  };

  useEffect(() => {
    if (id) {
      findStock(id);
    }
  }, [id]);

  const handleStockClose = () => {
    router.back();
  };

  const { control, reset, handleSubmit } = useForm<StockFields>();

  const onSubmit = async (values: StockFields) => {
    try {
      if (type === "edit") {
        await updateStock({
          ...convertIntObj(values),
          id,
        }).unwrap();
        enqueueSnackbar(`Успешно обновлено`, {
          variant: "success",
        });
      }
      if (type === "create") {
        await createStock(convertIntObj(values)).unwrap();
        enqueueSnackbar(`Успешно создано`, {
          variant: "success",
        });
      }
      reset({});
      router.back();
    } catch (e) {
      enqueueSnackbar(`Произошла ошибка`, {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStock(itemToDelete).unwrap();
      setItemToDelete(0);
      enqueueSnackbar(`Позиция удалена`, {
        variant: "success",
      });
      router.back();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Modal
        open={modalType === "stock" && (type === "edit" || type === "create")}
        sx={{ overflowY: "scroll" }}
        onClose={handleStockClose}
        keepMounted={false}
        disableScrollLock
      >
        <Box
          sx={{
            top: "25%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            position: "absolute" as "absolute",
            zIndex: 100,
            "@media(max-height: 1440px)": {
              // top: 10,
              transform: "translate(-50%, 0%)",
            },
          }}
        >
          <Box
            sx={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h4" gutterBottom>
              {type === "edit"
                ? `Редактирование`
                : type === "create"
                ? `Создание новой позиции на складе`
                : null}
            </Typography>
            <IconButton onClick={handleStockClose}>
              <CloseOutlinedIcon />
            </IconButton>
          </Box>
          <Grid marginBottom={2} container spacing={2}>
            <Grid item xs={8}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="name"
                    required
                    value={value ?? ""}
                    fullWidth
                    onChange={onChange}
                    label="Наименование"
                    variant="outlined"
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    required
                    type="number"
                    value={value ?? ""}
                    fullWidth
                    onChange={onChange}
                    label="Количество"
                    variant="outlined"
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="device_id"
                control={control}
                rules={{
                  required: "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="device_id">
                      {ItemNames["device"]}
                    </InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "device_id",
                        name: "device_id",
                      }}
                      id="device_id"
                      value={value ?? 0}
                      onChange={onChange}
                      input={
                        <OutlinedInput
                          id="device_id"
                          label={ItemNames["device"]}
                        />
                      }
                    >
                      <option disabled selected value={0}>
                        {ItemNames["device"]}
                      </option>
                      {catalogs?.stock_device.map((item) => (
                        <option key={item.id} value={+item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Controller
                name="description"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="description"
                    value={value ?? ""}
                    fullWidth
                    onChange={onChange}
                    label={ItemNames["description"]}
                    variant="outlined"
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>
              Сохранить
            </Button>
            {type === "edit" ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setItemToDelete(item.id)}
              >
                Удалить
              </Button>
            ) : null}
          </Box>
        </Box>
      </Modal>
      <AlertDialog
        open={!!itemToDelete}
        handleClose={() => setItemToDelete(0)}
        text={`Удалить позицию с наименованием ${item?.name}?`}
        confirmAction={handleDelete}
        confirmText={"Да, удалить"}
      />
    </>
  );
};

export default StockItem;
