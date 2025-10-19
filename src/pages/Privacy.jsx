import { Box, Container, Typography, Paper, Divider } from '@mui/material';

export default function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={1} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: October 19, 2025
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect information you provide directly to us, including when you create an account,
              generate podcasts, or contact us for support. This may include your email address, name,
              and the topics you choose to generate podcasts about.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect to:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body1" paragraph>
                Provide, maintain, and improve our services
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Generate AI-powered podcast content based on your requests
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Send you technical notices and support messages
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Respond to your comments and questions
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" paragraph>
              We do not sell, trade, or rent your personal information to third parties. We may share
              information with service providers who assist us in operating our platform, conducting our
              business, or serving our users, as long as those parties agree to keep this information
              confidential.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              4. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized or unlawful processing, accidental loss, destruction,
              or damage.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              5. Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              You have the right to access, update, or delete your personal information at any time.
              You can also object to or restrict certain processing of your data. To exercise these
              rights, please contact us at privacy@explainedin60sec.com.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              6. Cookies and Tracking
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar tracking technologies to track activity on our service and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              7. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              8. Changes to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              9. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy, please contact us at:
            </Typography>
            <Typography variant="body1" paragraph>
              Email: privacy@explainedin60sec.com
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

