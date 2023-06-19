import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import {
  ICatalogs,
  useCreateCatalogMutation,
  useUpdateCatalogMutation,
} from "redux/catalog/catalog.api";
import { CatalogNames } from "src/constants/translations";

type Props = {
  catalogId: number;
  onClose: () => void;
  type: "edit" | "create" | undefined;
  catalogType: ICatalogs;
  defaultValue?: string;
};

const CatalogModal = ({
  catalogId,
  onClose,
  type,
  defaultValue,
  catalogType,
}: Props) => {
  const [createCatalog] = useCreateCatalogMutation();
  const [updateCatalog] = useUpdateCatalogMutation();

  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async () => {
    try {
      if (type === "create") {
        const response = await createCatalog({
          catalog: catalogType,
          name: value,
        }).unwrap();
        enqueueSnackbar("Позиция создана", { variant: "success" });
      }
      if (type === "edit") {
        const response = await updateCatalog({
          catalog: catalogType,
          name: value,
          id: catalogId,
        }).unwrap();
        enqueueSnackbar("Позиция отредактирована", { variant: "success" });
      }
      onClose();
      setValue("");
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Произошла ошибка", { variant: "error" });
    }
  };

  return (
    <Modal
      open={!!type}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
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
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {type === "create" ? "Создание " : "Редактирование"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
        <TextField
          margin="normal"
          required
          value={value}
          fullWidth
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          id="outlined-basic"
          label={CatalogNames[catalogType]}
          variant="outlined"
          defaultValue={defaultValue}
        />
        <Button variant="contained" disabled={!value} onClick={onSubmit}>
          Сохранить
        </Button>
      </Box>
    </Modal>
  );
};

export default CatalogModal;
