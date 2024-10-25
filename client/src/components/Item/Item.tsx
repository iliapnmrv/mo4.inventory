import AddIcon from "@mui/icons-material/Add";
import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Modal,
  NativeSelect,
  OutlinedInput,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AlertDialog from "components/Dialog/Dialog";
import QR from "components/QR/QR";
import LogsTable from "components/Table/LogsTable";
import { useActions } from "hooks/actions";
import { useAppSelector } from "hooks/redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import "photoswipe/dist/photoswipe.css";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Gallery, Item as PSItem } from "react-photoswipe-gallery";
import { useGetCatalogsQuery } from "redux/catalog/catalog.api";
import {
  IFile,
  useDeleteFileMutation,
  useDeleteInstructionMutation,
  useUploadFilesMutation,
  useUploadInstructionMutation,
} from "redux/item/file.api";
import {
  useAddStockToItemMutation,
  useArchiveItemMutation,
  useCreateItemMutation,
  useDeleteItemMutation,
  useFindLastQRQuery,
  useFindSerialNumberAvailableMutation,
  useFindUniqueNamesQuery,
  useLazyGetItemQuery,
  useDeleteStockFromItemMutation,
  useUpdateItemMutation,
  useUpdateManyMutation,
} from "redux/item/item.api";
import { useGetStockItemsQuery } from "redux/stock/stock.api";
import { queryClient } from "src/app/providers";
import { ItemNames } from "src/constants/translations";
import { IException } from "src/types/types";
import {
  QRzeros,
  convertIntObj,
  removeBasepathFromPathname,
} from "src/utils/utils";
import SelectedItems from "./SelectedItems";
import moment from "moment";

type Props = {};

export type ItemFields = {
  qr: number;
  name: string;
  month: number;
  year: number;
  serial_number: string;
  model: string;
  description: string | null;
  additional_information: string | null;
  instruction_id: number | null;
  status_id: number;
  user_id: number;
  person_id: number;
  place_id: number;
  device_id: number;
  type_id: number;
};

const Item = (props: Props) => {
  const [getItem, { data: item }] = useLazyGetItemQuery();

  const pathname = usePathname();
  const [instruction, setInstruction] = useState<IFile>();
  const [files, setFiles] = useState<IFile[]>();
  const [openAddStock, setOpenAddStock] = useState<boolean>(false);

  const [fileToDelete, setFileToDelete] = useState<{
    type?: "file" | "instruction";
    id?: number;
    name?: string;
  }>({});
  const [stockToDelete, setStockToDelete] = useState<{
    id?: number;
    name?: string;
  }>({});
  const [itemToDelete, setItemToDelete] = useState(0);
  const [itemToArchive, setItemToArchive] = useState(0);
  const [stockQuery, setStockQuery] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const qr = +searchParams.get("qr");
  const type = searchParams.get("type");
  const modalType = searchParams.get("modalType");

  const { data: stockItems } = useGetStockItemsQuery({
    q: stockQuery,
    item_qr: qr,
  });

  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const [checkSerialNumber] = useFindSerialNumberAvailableMutation();
  const [updateItem] = useUpdateItemMutation();
  const [updateMany] = useUpdateManyMutation();
  const [createItem] = useCreateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [archiveItem] = useArchiveItemMutation();

  const [uploadFiles] = useUploadFilesMutation();
  const [uploadInstruction] = useUploadInstructionMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [deleteInstruction] = useDeleteInstructionMutation();
  const [addStock, { isLoading: isAddStockLoading }] =
    useAddStockToItemMutation();

  const [deleteStock] = useDeleteStockFromItemMutation();

  const { data: catalogs } = useGetCatalogsQuery();

  const { data: names } = useFindUniqueNamesQuery();
  const { data: lastQr, refetch: refetchLastQr } = useFindLastQRQuery();

  const { selectedItems } = useAppSelector((state) => state.item);
  const { resetSelected } = useActions();

  const removeValuesFromItem = (item: any) => {
    return {
      qr: item?.qr ?? "",
      name: item?.name ?? "",
      model: item?.model ?? "",
      place_id: item?.place_id ?? "",
      status_id: item?.status_id ?? "",
      device_id: item?.device_id ?? "",
      type_id: item?.type_id ?? "",
      user_id: item?.user_id ?? "",
      person_id: item?.person_id ?? "",
      year: item?.year ?? "",
      month: item?.month ?? "",
      description: item?.description ?? "",
      serial_number: item?.serial_number ?? "",
      additional_information: item?.additional_information ?? "",
    };
  };

  const { control, getValues, setValue, reset, handleSubmit, watch } =
    useForm<ItemFields>({
      defaultValues: useMemo(() => {
        setFiles(item?.files);
        setInstruction(item?.instruction);
        return removeValuesFromItem(item);
      }, [item]),
    });

  useEffect(() => {
    if (type === "edit") {
      reset(removeValuesFromItem(item));
      getItem(qr);
    }
    if (type === "multiple_edit") {
      reset({});
      // reset(item);
      setFiles(null);
      setInstruction(null);
    }
    if (type === "copy") {
      refetchLastQr();
      getItem(qr);
      reset(removeValuesFromItem(item));
      setValue("qr", lastQr + 1);
      setFiles(null);
      setInstruction(null);
    }

    if (type === "create") {
      setFiles(null);
      setInstruction(null);
      reset({});
      setValue("qr", lastQr + 1);
    }
  }, [item, reset, type, lastQr, refetchLastQr, qr, getItem, setValue]);

  const handleClose = (
    event: {},
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    if (
      !(JSON.stringify(item) === JSON.stringify(getValues())) &&
      reason == "backdropClick"
    )
      return;
    reset({});
    router.push("/");
  };

  const onSubmit = async (values: ItemFields) => {
    try {
      if (type === "edit") {
        const response = await updateItem({
          ...convertIntObj(values),
        }).unwrap();
        enqueueSnackbar(`Успешно обновлено ${QRzeros(item.qr)}`, {
          variant: "success",
        });
      }
      if (type === "multiple_edit") {
        let deletedNulls = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v != null)
        );
        const qrs = selectedItems.map((item) => item.qr);
        await updateMany({
          ...convertIntObj(deletedNulls),
          qrs,
        });

        resetSelected();
        enqueueSnackbar(
          `Обновлены коды ${qrs.map((qr) => QRzeros(qr)).join(",  ")}`,
          {
            variant: "success",
          }
        );
        resetSelected();
      }
      if (type === "create" || type === "copy") {
        //@ts-ignore
        const response = await createItem(convertIntObj(values)).unwrap();
        enqueueSnackbar(`Создано ${QRzeros(response.qr)}`);
        router.push(
          `${removeBasepathFromPathname(pathname)}/?qr=${
            response.qr
          }&type=edit&modalType=qr`
        );
      }
      router.back();
      reset({});
      setFiles(null);
      setInstruction(null);
    } catch (e) {
      console.log(e);
    } finally {
      queryClient.invalidateQueries("items");
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    const uploadedFiles = await uploadFiles({
      body: formData,
      qr: item.qr,
    }).unwrap();
    enqueueSnackbar(`Файл загружен`, { variant: "success" });
  };

  const handleInstructionUpload = async (instruction: File) => {
    const formData = new FormData();
    formData.append("instruction", instruction);
    const uploadedInstruction = await uploadInstruction({
      body: formData,
      model: item.model,
    }).unwrap();
    setInstruction(uploadedInstruction);
    enqueueSnackbar(`Инструкция загружена`, { variant: "success" });
  };

  const handleFileToDelete = async () => {
    try {
      if (fileToDelete.type === "file") {
        const response = await deleteFile(fileToDelete.id).unwrap();
        enqueueSnackbar(`Файл ${fileToDelete.name} удален`, {
          variant: "success",
        });
      }
      if (fileToDelete.type === "instruction") {
        const response = await deleteInstruction(fileToDelete.id).unwrap();
        setInstruction(null);
        enqueueSnackbar(`Инструкция ${fileToDelete.name} удалена`, {
          variant: "success",
        });
      }
      setFileToDelete({});
    } catch (e) {
      console.log(e);
    }
  };

  const onSerialNumberCheck = async (value: string) => {
    try {
      await checkSerialNumber(value).unwrap();
      return true;
    } catch (e) {
      return (e as IException).data.message;
    }
  };

  const onItemCopy = () => {
    router.push(`/?qr=${item.qr}&type=copy&modalType=qr`);
  };

  const handleDelete = async (item: number) => {
    try {
      await deleteItem(item).unwrap();
      enqueueSnackbar(`QR ${QRzeros(item)} удален`, {
        variant: "success",
      });
      setItemToDelete(0);
      router.back();
    } catch (e) {
      console.log("error while deleting", e);
    }
  };

  const handleArchive = async (item: number) => {
    try {
      await archiveItem(item).unwrap();
      enqueueSnackbar(`QR ${QRzeros(item)} архивирован`, {
        variant: "success",
      });
      setItemToArchive(0);
      router.back();
    } catch (e) {
      console.log("error while archiving", e);
    }
  };

  const addStockToMultipleHandler = async () => {
    try {
    } catch (e) {
      console.log(e);
    }
  };

  const addStockHandler = async (stockId: number) => {
    try {
      setOpenAddStock(false);
      await addStock({ model: item.model, stockId }).unwrap();
      enqueueSnackbar(`Успешно добавлено`, {
        variant: "success",
      });
      queryClient.invalidateQueries("items");
    } catch (e) {
      console.log(e);
    }
  };

  const deleteStockHandler = async (stockId: number) => {
    try {
      await deleteStock({ model: item.model, stockId }).unwrap();
      enqueueSnackbar(`Удалено`, {
        variant: "success",
      });
      setStockToDelete({});
      queryClient.invalidateQueries("items");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Modal
        open={modalType === "qr"}
        sx={{
          overflowY: "scroll",
          // top: "64px !important",
        }}
        onClose={handleClose}
        keepMounted={false}
        disableScrollLock
      >
        <Box
          sx={{
            //   top: "50%",
            left: "50%",
            transform: "translate(-50%, 0%)",
            width: "80%",
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
                ? `Редактирование ${QRzeros(qr)}`
                : type === "create"
                ? `Создание новой позиции с QR ${QRzeros(lastQr + 1)}`
                : type === "multiple_edit"
                ? `Редактирование нескольких QR кодов`
                : type === "copy"
                ? `Создание копированием на основе позиции ${QRzeros(qr)}`
                : null}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseOutlinedIcon />
            </IconButton>
          </Box>
          {type === "edit" ? (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Числится: {item?.analysis.listed ?? 0}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    В наличии: {item?.analysis.in_stock}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Участвовал в инвентаризации:{" "}
                    {item?.last_found_at
                      ? moment(item.last_found_at).format("DD.MM.YYYY HH:mm:ss")
                      : "--"}
                  </Typography>
                  <Tooltip title="Произвольная проверка карточки">
                    <Typography variant="h6" gutterBottom>
                      Проверено:{" "}
                      {item?.checked_at
                        ? moment(item.checked_at).format("DD.MM.YYYY HH:mm:ss")
                        : "--"}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <FormControlLabel
                control={<Checkbox />}
                label="Проверен"
                value={isChecked}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setIsChecked(event.target.checked)
                }
              />
            </Box>
          ) : null}
          {type === "multiple_edit" ? <SelectedItems /> : null}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Controller
                name="qr"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    disabled
                    id="qr"
                    value={QRzeros(value)}
                    onChange={onChange}
                    fullWidth
                    type="number"
                    label={ItemNames["qr"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="month"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                  max: { value: 12, message: "Неверный месяц" },
                  min: { value: 1, message: "Неверный месяц" },
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="month"
                    value={value}
                    required
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["month"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="year"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                  min: { value: 1, message: "Неверный год" },
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    required
                    id="year"
                    value={value}
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["year"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="device_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
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
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput
                          id="device_id"
                          label={ItemNames["device"]}
                        />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["device"]}
                      </option>
                      {catalogs?.device.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="status_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="status_id">
                      {ItemNames["status"]}
                    </InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "status_id",
                        name: "status_id",
                      }}
                      id="status_id"
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput
                          id="status_id"
                          label={ItemNames["status"]}
                        />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["status"]}
                      </option>
                      {catalogs?.status.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="person_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="person_id">
                      {ItemNames["person"]}
                    </InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "person_id",
                        name: "person_id",
                      }}
                      id="person_id"
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput
                          id="person_id"
                          label={ItemNames["person"]}
                        />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["person"]}
                      </option>
                      {catalogs?.person.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="type_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="type_id">{ItemNames["type"]}</InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "type_id",
                        name: "type_id",
                      }}
                      id="type_id"
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput id="type_id" label={ItemNames["type"]} />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["type"]}
                      </option>
                      {catalogs?.type.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="user_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="user_id">{ItemNames["user"]}</InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "user_id",
                        name: "user_id",
                      }}
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput id="user_id" label={ItemNames["user"]} />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["user"]}
                      </option>
                      {catalogs?.user.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="place_id"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormControl required fullWidth error={Boolean(error)}>
                    <InputLabel id="place_id">{ItemNames["place"]}</InputLabel>
                    <NativeSelect
                      inputProps={{
                        id: "place_id",
                        name: "place_id",
                      }}
                      id="place_id"
                      value={value}
                      onChange={onChange}
                      input={
                        <OutlinedInput
                          id="place_id"
                          label={ItemNames["place"]}
                        />
                      }
                    >
                      <option disabled selected value="">
                        {ItemNames["place"]}
                      </option>
                      {catalogs?.place.map((item) => (
                        <option key={item.id} value={item.id}>
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
                name="name"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    freeSolo
                    disablePortal
                    id="name"
                    value={value}
                    onChange={(e: any, newValue: string | null) =>
                      onChange(newValue)
                    }
                    options={names?.map((item) => item.name) ?? []}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        value={value}
                        required
                        fullWidth
                        onChange={onChange}
                        label={ItemNames["name"]}
                        error={Boolean(error)}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="serial_number"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                  validate: async (value) =>
                    type === "multiple_edit" ||
                    (item?.serial_number === value && type !== "copy") ||
                    (await onSerialNumberCheck(value)),
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="serial_number"
                    value={value}
                    required
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["serial_number"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                    disabled={type === "multiple_edit"}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="model"
                control={control}
                rules={{
                  required: type !== "multiple_edit" && "Поле обязательно",
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="model"
                    value={value}
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["model"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    multiline
                    rows={3}
                    maxRows={4}
                    id="description"
                    value={value}
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["description"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="additional_information"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    id="additional_information"
                    value={value}
                    onChange={onChange}
                    fullWidth
                    label={ItemNames["additional_information"]}
                    error={Boolean(error)}
                    helperText={error?.message}
                    rows={2}
                    maxRows={2}
                    multiline
                  />
                )}
              />
            </Grid>
          </Grid>
          {item && type === "edit" ? <QR item={item} /> : null}
          {type === "edit" ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Склад
              </Typography>
              <List dense>
                {item?.stock_items?.map((stock_item) => (
                  <ListItem
                    key={stock_item.id}
                    secondaryAction={
                      <IconButton
                        onClick={() =>
                          setStockToDelete({
                            id: stock_item.id,
                            name: stock_item.name,
                          })
                        }
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box
                      sx={{
                        flexDirection: "row",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ mr: 2 }} variant="h5">
                        {stock_item.quantity} шт.
                      </Typography>
                      <ListItemText
                        primary={stock_item.name}
                        secondary={stock_item.description}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Box>
                {isAddStockLoading ? (
                  <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
                ) : null}
              </Box>
              {openAddStock && stockItems.length ? (
                <Autocomplete
                  sx={{ width: 300 }}
                  options={stockItems.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  autoFocus
                  onChange={(e, value) => addStockHandler(value.value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      onChange={(e) => setStockQuery(e.target.value)}
                      label="Выберите позицию со склада"
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  )}
                />
              ) : (
                <Button
                  variant="text"
                  onClick={() => setOpenAddStock(true)}
                  startIcon={<AddIcon />}
                >
                  Добавить позицию
                </Button>
              )}
            </Box>
          ) : null}

          <Box sx={{ my: 2 }}>
            {type === "edit" ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Инструкции и файлы
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<ListAltOutlinedIcon />}
                  disabled={false}
                >
                  Добавить инструкцию
                  <input
                    onChange={(event) => {
                      handleInstructionUpload(event.target.files[0]);
                      event.target.value = null;
                    }}
                    hidden
                    accept="application/pdf"
                    type="file"
                  />
                </Button>
                <Tooltip title="Инструкция отображается у всех позиций с одинаковым наименованием">
                  <IconButton sx={{ ml: 1 }}>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                {instruction?.path ? (
                  <Gallery
                    options={{
                      zoom: true,
                    }}
                  >
                    <PSItem
                      content={
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <iframe
                            style={{ display: "block" }}
                            src={
                              process.env.NEXT_PUBLIC_SERVER_URL +
                              instruction?.path
                            }
                            key={0}
                            width="1400px"
                            height="1080px"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                          />
                        </div>
                      }
                      original={
                        process.env.NEXT_PUBLIC_SERVER_URL + instruction.path
                      }
                    >
                      {({ ref, open }) => (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <a
                            href={
                              process.env.NEXT_PUBLIC_SERVER_URL +
                              instruction.path
                            }
                            download
                          >
                            <IconButton aria-label="download">
                              <FileDownloadIcon />
                            </IconButton>
                          </a>
                          <Typography onClick={open}>
                            Инструкция: {instruction.name}
                          </Typography>
                          <IconButton
                            aria-label="delete"
                            onClick={() =>
                              setFileToDelete({
                                type: "instruction",
                                id: instruction.id,
                                name: instruction.name,
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </PSItem>
                  </Gallery>
                ) : null}

                <Box sx={{ my: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachmentOutlinedIcon />}
                  >
                    Добавить изображения
                    <input
                      onChange={(event) => {
                        handleFileUpload(event.target.files);
                        event.target.value = null;
                      }}
                      hidden
                      accept="image/*"
                      type="file"
                      multiple
                    />
                  </Button>
                  <Tooltip title="Изображения отображаются только у определенного QR кода">
                    <IconButton sx={{ ml: 1 }}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                  {files?.length ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <List dense={true}>
                        {files?.map((file, index) => (
                          <ListItem
                            key={index}
                            style={{
                              maxHeight: 300,
                              flexDirection: "column",
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box
                              sx={{
                                flexDirection: "row",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <a
                                href={
                                  process.env.NEXT_PUBLIC_SERVER_URL + file.path
                                }
                                download
                              >
                                <IconButton aria-label="download">
                                  <FileDownloadIcon />
                                </IconButton>
                              </a>
                              <ListItemText primary={file?.name} />
                              <IconButton
                                aria-label="delete"
                                onClick={() =>
                                  setFileToDelete({
                                    type: "file",
                                    id: file.id,
                                    name: file.name,
                                  })
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : null}
                  {files?.length ? (
                    <Gallery
                      options={{
                        zoom: true,
                      }}
                    >
                      <div
                        style={{
                          gridTemplateColumns: "1fr 1fr 1fr",
                          display: "grid",
                          gridAutoFlow: "row",
                          gap: "10px",
                        }}
                      >
                        {files.map((file) => (
                          <PSItem
                            content={
                              //@ts-ignore
                              <img
                                style={{
                                  objectFit: "contain",
                                  width: "100%",
                                  height: "100%",
                                }}
                                alt="image"
                                src={
                                  process.env.NEXT_PUBLIC_SERVER_URL + file.path
                                }
                              />
                            }
                            key={file.id}
                            original={
                              process.env.NEXT_PUBLIC_SERVER_URL + file.path
                            }
                            width={1200}
                            height={800}
                          >
                            {({ ref, open }) => (
                              //@ts-ignore
                              <img
                                // width={400}
                                // height={200}
                                style={{
                                  objectFit: "contain",
                                  width: 400,
                                  height: 200,
                                }}
                                alt="image"
                                ref={
                                  ref as React.MutableRefObject<HTMLImageElement>
                                }
                                onClick={open}
                                src={
                                  process.env.NEXT_PUBLIC_SERVER_URL + file.path
                                }
                              />
                            )}
                          </PSItem>
                        ))}
                      </div>
                    </Gallery>
                  ) : null}
                </Box>
              </>
            ) : null}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                Сохранить
              </Button>
              {type === "edit" ? (
                <Button
                  variant="outlined"
                  startIcon={<CopyAllOutlinedIcon />}
                  onClick={onItemCopy}
                >
                  Скопировать
                </Button>
              ) : null}
            </Stack>

            {type === "edit" ? (
              <Stack direction="row" spacing={1}>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setItemToArchive(item.qr)}
                >
                  Переместить в архив
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setItemToDelete(item.qr)}
                >
                  Удалить
                </Button>
              </Stack>
            ) : null}
          </Box>

          {type === "edit" ? <LogsTable logs={item?.logs} /> : null}
        </Box>
      </Modal>
      <AlertDialog
        open={!!fileToDelete?.id}
        handleClose={() => setFileToDelete({})}
        text={`Удалить ${
          fileToDelete?.type === "file" ? "файл" : "инструкцию"
        } с наименованием ${fileToDelete.name} ${
          fileToDelete?.type === "file"
            ? ""
            : `у всех позиций с моделью ${item?.model}`
        } ?`}
        confirmAction={handleFileToDelete}
        confirmText={"Да, удалить"}
      />
      <AlertDialog
        open={!!itemToDelete}
        handleClose={() => setItemToDelete(0)}
        text={`Удалить QR код ${QRzeros(itemToDelete)}?`}
        confirmAction={() => handleDelete(itemToDelete)}
        confirmText={"Да, удалить"}
      />
      <AlertDialog
        open={!!itemToArchive}
        handleClose={() => setItemToArchive(0)}
        text={`Архивировать QR код ${QRzeros(itemToArchive)}?`}
        confirmAction={() => handleArchive(itemToArchive)}
        confirmText={"Да, архивировать"}
      />
      <AlertDialog
        open={!!stockToDelete?.id}
        handleClose={() => setStockToDelete({})}
        text={`Удалить ${stockToDelete.name} у всех позиций с моделью ${item?.model}?`}
        confirmAction={() => deleteStockHandler(stockToDelete.id)}
        confirmText={"Да, удалить"}
      />
    </>
  );
};

export default Item;
