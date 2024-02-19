"use client";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  NativeSelect,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AnalysisModal from "components/Avalysis/AnalysisModal";
import type { Filters as IFilters } from "components/Filters/Filters";
import Filters from "components/Filters/Filters";
import Item from "components/Item/Item";
import SelectedItems from "components/Item/SelectedItems";
import { MemoTable } from "components/Table/Table";
import { useActions } from "hooks/actions";
import { useDebounce } from "hooks/debounce";
import { useAppSelector } from "hooks/redux";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useInfiniteQuery } from "react-query";
import {
  IItem,
  IQuery,
  Response,
  useExportDataMutation,
} from "redux/item/item.api";
import { getItems } from "src/api/api";
import ClearIcon from "@mui/icons-material/Clear";

export default function Home() {
  const [exportData] = useExportDataMutation();

  const { filters } = useAppSelector((state) => state.item);
  const { setFilters } = useActions();

  const methods = useForm<IFilters>({
    defaultValues: filters,
  });

  const { q, ...filter } = useWatch({ control: methods.control });

  const debouncedSearchQuery = useDebounce(q, 500);

  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<boolean>(false);
  const [showPlace, setShowPlace] = useState<boolean>(false);
  const [showZeroCartridges, setShowZeroCartridges] = useState<boolean>(false);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery<
    Response<IItem[]>,
    any,
    Response<IItem[]>,
    [string, Partial<IQuery>]
  >(
    [
      "items",
      {
        ...filter,
        showArchive,
        showZeroCartridges,
        q: debouncedSearchQuery?.trim(),
        include: true,
      },
    ],

    ({ queryKey, pageParam = 0 }) =>
      getItems({
        ...queryKey[1],
        offset: pageParam,
        limit: 20,
      }),
    {
      getNextPageParam: (lastPage, pages) => {
        const flattenPages = pages.flatMap((page) => page.data);

        return lastPage.data.length === 20 ? flattenPages.length : undefined;
      },
    }
  );

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  const onDataExport = async (filterData?: IQuery) => {
    try {
      const response = await exportData(filterData).unwrap();

      const link = document.createElement("a");
      link.setAttribute("download", response.file);
      link.href = process.env.NEXT_PUBLIC_SERVER_URL + response.file;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.log(e);
    }
  };

  const { selectedItems } = useAppSelector((state) => state.item);

  const onSubmit = async (data: IFilters) => {
    try {
      setFilters(data);
    } catch (e) {
      console.log(e);
    }
  };

  const router = useRouter();

  return (
    <FormProvider {...methods}>
      <Box sx={{ position: "relative", flexDirection: "row", display: "flex" }}>
        <Box
          style={{
            position: "sticky",
            top: 80,
            overflow: "auto",
            height: "100%",
            width: 300,
          }}
        >
          <Filters onSubmit={onSubmit}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showArchive}
                  onChange={(e) => setShowArchive(e.target.checked)}
                />
              }
              label="Включить архив"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showZeroCartridges}
                  onChange={(e) => setShowZeroCartridges(e.target.checked)}
                />
              }
              label="Показать карточки где 0 картриджей"
            />
          </Filters>
        </Box>
        <Box>
          <Box
            sx={{
              position: "sticky",
              top: 80,
              zIndex: 15,
              backgroundColor: "white !important",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Stack direction="row" spacing={1}>
                <Tooltip title="Анализ">
                  <Button
                    sx={{ px: 1, height: 37, minWidth: "unset" }}
                    onClick={() => setAnalysis(!analysis)}
                    variant="outlined"
                  >
                    <AssessmentOutlinedIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Экспорт всех данных">
                  <Button
                    sx={{ px: 1, height: 37, minWidth: "unset" }}
                    onClick={() => onDataExport({ showArchive: true })}
                    variant="outlined"
                  >
                    <FileDownloadOutlinedIcon />
                  </Button>
                </Tooltip>
              </Stack>

              <Controller
                name="q"
                control={methods.control}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth variant="standard" sx={{ mx: 1 }}>
                    <OutlinedInput
                      id="q"
                      placeholder="Поиск..."
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchOutlinedIcon />
                        </InputAdornment>
                      }
                      value={value}
                      inputProps={{
                        style: { padding: "7.5px 0px" },
                      }}
                      endAdornment={
                        value && (
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => onChange("")}
                          >
                            <ClearIcon />
                          </IconButton>
                        )
                      }
                      onChange={onChange}
                      fullWidth
                    />
                  </FormControl>
                )}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  minWidth: selectedItems.some((qr) => qr) ? "460px" : "208px",
                }}
              >
                {selectedItems.length ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() =>
                      router.push(`/?modalType=qr&type=multiple_edit`)
                    }
                    sx={{ mr: 1, py: "6px" }}
                  >
                    Изменить выбранные
                  </Button>
                ) : null}

                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  onClick={() => router.push(`/?modalType=qr&type=create`)}
                  sx={{ py: "6px" }}
                >
                  Создать позицию
                </Button>
              </Box>
            </Box>
            <FormGroup
              sx={{
                flexDirection: "row",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPlace}
                      onChange={(e) => setShowPlace(e.target.checked)}
                    />
                  }
                  label="Показать местоположения"
                />
                <Stack
                  spacing={1}
                  direction="row"
                  sx={{ alignItems: "flex-end" }}
                >
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    Найдено {data?.pages[0].meta.total} позиций
                  </Typography>
                  <Tooltip title="Скачать найденные">
                    <Button
                      sx={{
                        px: 0.5,
                        height: 35,
                        minWidth: "unset",
                        border: "unset",
                      }}
                      onClick={() =>
                        onDataExport({
                          ...filter,
                          showArchive,
                          include: true,
                          q: debouncedSearchQuery,
                        })
                      }
                      variant="outlined"
                    >
                      <FileDownloadOutlinedIcon />
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
              <Box>
                <FormControl
                  variant="outlined"
                  sx={{ padding: 0, my: 1, width: 300 }}
                >
                  <InputLabel htmlFor="q">Сортировка</InputLabel>
                  <NativeSelect
                    sx={{ padding: 0 }}
                    inputProps={{
                      id: "q",
                      name: "q",
                    }}
                    variant="outlined"
                    id="q"
                    onChange={(value) => {
                      const parsed = JSON.parse(value!.target!.value);
                      Object.keys(parsed).forEach((key: keyof IQuery) =>
                        methods.setValue(key, parsed[key])
                      );
                    }}
                    input={<OutlinedInput id="q" label="Сортировка" />}
                  >
                    <option value='{"sortBy": "qr", "direction": "asc"}'>
                      По возрастанию QR {"1 -> 1000"}
                    </option>
                    <option value='{"sortBy": "qr", "direction": "desc"}'>
                      По убыванию QR {"1000 -> 1"}
                    </option>
                    <option value='{"sortBy": "createdAt", "direction": "desc"}'>
                      По дате создания
                    </option>
                    <option value='{"sortBy": "updatedAt", "direction": "desc"}'>
                      По последнему изменению
                    </option>
                    <option value='{"sortBy": "name", "direction": "asc"}'>
                      По наименованию {"А -> Я"}
                    </option>
                  </NativeSelect>
                </FormControl>
              </Box>
            </FormGroup>
            <SelectedItems />
          </Box>

          <MemoTable
            isLoading={isLoading}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            data={items}
            showPlace={showPlace}
          />
          <Item />
          <AnalysisModal open={analysis} setOpen={setAnalysis} />
        </Box>
      </Box>
    </FormProvider>
  );
}
