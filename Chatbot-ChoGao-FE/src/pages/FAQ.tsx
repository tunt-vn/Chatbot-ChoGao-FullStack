import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import HelpIcon from '@mui/icons-material/esm/HelpOutline'
import ExpandMoreIcon from '@mui/icons-material/esm/ExpandMore'

const faqs = [
  { q: 'Làm thế nào để đăng ký tuyển sinh?', a: 'Truy cập mục Tuyển sinh trên website hoặc liên hệ văn phòng.' },
  { q: 'Lịch thi học kỳ?', a: 'Lịch thi sẽ được thông báo trên hệ thống và gửi qua thông báo đến phụ huynh.' },
]

export default function FAQ() {
  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<HelpIcon />}
          label="Trợ giúp nhanh"
          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Câu hỏi thường gặp (FAQ)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy câu trả lời? Hãy nhắn tin qua mục Trợ lý Chat để được hỗ trợ thêm.
        </Typography>
      </Box>

      <Paper
        sx={{
          borderRadius: 4,
          p: 2,
          border: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.92)',
        }}
      >
        {faqs.map((item, index) => (
          <Accordion key={item.q} disableGutters elevation={0} square={false} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Stack>
  )
}
