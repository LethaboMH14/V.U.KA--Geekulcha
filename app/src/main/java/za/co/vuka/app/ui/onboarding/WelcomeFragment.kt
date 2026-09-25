package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.AccountStore

class WelcomeFragment : Fragment(R.layout.fragment_welcome) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btnGetStarted = view.findViewById<Button>(R.id.btnGetStarted)
        val btnGuardian = view.findViewById<Button>(R.id.btnGuardian)

        btnGetStarted.setOnClickListener {
            findNavController().navigate(R.id.action_welcome_to_signIn)
        }

        btnGuardian.setOnClickListener {
            findNavController().navigate(
                if (AccountStore(requireContext()).guardianEnrolled) R.id.action_welcome_to_standby
                else R.id.action_welcome_to_guardianEnrol
            )
        }
    }
}