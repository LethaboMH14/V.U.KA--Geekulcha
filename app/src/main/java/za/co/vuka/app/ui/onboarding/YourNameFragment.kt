package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import com.google.android.material.button.MaterialButton

class YourNameFragment : Fragment(R.layout.fragment_your_name) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val tvIntro = view.findViewById<TextView>(R.id.tvIntro)
        val etFirstName = view.findViewById<EditText>(R.id.etFirstName)
        val etSurname = view.findViewById<EditText>(R.id.etSurname)
        val errorContainer = view.findViewById<View>(R.id.errorContainer)

        if (onboardingViewModel.googleUsed.value) {
            tvIntro.text = "We've filled this in from your Google account. Change it if you'd rather guardians see something else."
            etFirstName.setText(onboardingViewModel.firstName.value)
            etSurname.setText(onboardingViewModel.surname.value)
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            findNavController().navigateUp()
        }

        view.findViewById<MaterialButton>(R.id.btnContinue).setOnClickListener {
            val first = etFirstName.text.toString().trim()
            val last = etSurname.text.toString().trim()

            if (first.isEmpty() || last.isEmpty()) {
                errorContainer.visibility = View.VISIBLE
                return@setOnClickListener
            }

            errorContainer.visibility = View.GONE
            onboardingViewModel.setName(first, last)
            findNavController().navigate(R.id.action_yourName_to_permissions)
        }
    }
}